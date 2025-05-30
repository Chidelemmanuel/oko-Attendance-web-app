'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Compass, Sparkles, Percent } from 'lucide-react';
import { verifyLocationAction } from './actions';
import type { VerifyAttendanceLocationOutput } from '@/ai/flows/attendance-location-verification';

const locationVerifierSchema = z.object({
  studentId: z.string().min(1, { message: 'Student ID is required.' }),
  latitude: z.coerce.number().min(-90).max(90, { message: 'Latitude must be between -90 and 90.' }),
  longitude: z.coerce.number().min(-180).max(180, { message: 'Longitude must be between -180 and 180.' }),
  expectedLatitude: z.coerce.number().min(-90).max(90, { message: 'Expected latitude must be between -90 and 90.' }),
  expectedLongitude: z.coerce.number().min(-180).max(180, { message: 'Expected longitude must be between -180 and 180.' }),
});

type LocationVerifierFormValues = z.infer<typeof locationVerifierSchema>;

export default function LocationVerifierPage() {
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerifyAttendanceLocationOutput | null>(null);

  const form = useForm<LocationVerifierFormValues>({
    resolver: zodResolver(locationVerifierSchema),
    defaultValues: {
      studentId: 'FPO/TEST/001',
      latitude: 6.0224, // Oko Poly Gate approx.
      longitude: 7.0700,
      expectedLatitude: 6.0224,
      expectedLongitude: 7.0700,
    },
  });

  async function onSubmit(data: LocationVerifierFormValues) {
    setIsVerifying(true);
    setVerificationResult(null);
    const result = await verifyLocationAction(data);
    
    if ('error' in result) {
      toast({
        variant: 'destructive',
        title: 'Verification Failed',
        description: result.error,
      });
    } else {
      setVerificationResult(result);
      toast({
        title: 'Verification Complete',
        description: `Probabilistic score: ${(result.isOnSiteProbability * 100).toFixed(0)}%`,
      });
    }
    setIsVerifying(false);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Location Verifier</CardTitle>
          <CardDescription>
            Test the AI-powered location verification. Enter submitted and expected coordinates to get a probabilistic on-site score.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="studentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter student ID" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="latitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Submitted Latitude</FormLabel>
                      <FormControl>
                        <Input type="number" step="any" placeholder="e.g., 6.0224" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="longitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Submitted Longitude</FormLabel>
                      <FormControl>
                        <Input type="number" step="any" placeholder="e.g., 7.0700" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="expectedLatitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expected Latitude (Class Location)</FormLabel>
                      <FormControl>
                        <Input type="number" step="any" placeholder="e.g., 6.0220" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="expectedLongitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expected Longitude (Class Location)</FormLabel>
                      <FormControl>
                        <Input type="number" step="any" placeholder="e.g., 7.0705" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isVerifying}>
                {isVerifying ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Compass className="mr-2 h-4 w-4" />
                )}
                Verify Location
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {verificationResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Verification Result
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-secondary/30">
                <div>
                    <p className="text-sm text-muted-foreground">On-Site Probability</p>
                    <p className="text-3xl font-bold text-primary">
                        {(verificationResult.isOnSiteProbability * 100).toFixed(0)}%
                    </p>
                </div>
                <Percent className="h-10 w-10 text-primary" />
            </div>
            
            {verificationResult.reasoning && (
              <div>
                <h4 className="font-semibold mb-1">AI Reasoning:</h4>
                <p className="text-sm text-muted-foreground p-3 border rounded-md bg-muted">
                  {verificationResult.reasoning}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}