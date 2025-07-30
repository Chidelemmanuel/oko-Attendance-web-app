
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { KeyRound, Settings2, ShieldCheck, AlertTriangle } from 'lucide-react';
import { MOCK_COURSES } from '@/lib/mock-data';

const setCodeSchema = z.object({
  courseCode: z.string().min(1, { message: 'Please select a course.' }),
  attendanceCode: z.string().min(4, { message: 'Code must be at least 4 characters.' }).max(10, {message: "Code must be at most 10 characters."}),
});

type SetCodeFormValues = z.infer<typeof setCodeSchema>;

function SetCodeCard({ children, isEnabled }: { children: React.ReactNode, isEnabled: boolean }) {
    if (!isEnabled) {
        return (
             <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-6 w-6 text-destructive" />
                        Location Not Verified
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        You must verify your location before you can set an attendance code.
                        Please use the sidebar link to start the verification process.
                    </p>
                </CardContent>
            </Card>
        );
    }
    return <Card className="max-w-2xl mx-auto">{children}</Card>;
}

export default function SetAttendanceCodePage() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const verifiedLatitude = searchParams.get('lat');
  const verifiedLongitude = searchParams.get('lon');
  const isPageEnabled = !!verifiedLatitude && !!verifiedLongitude;

  const form = useForm<SetCodeFormValues>({
    resolver: zodResolver(setCodeSchema),
    defaultValues: {
      courseCode: '',
      attendanceCode: '',
    },
  });

  async function onSubmit(data: SetCodeFormValues) {
    setIsLoading(true);
    try {
      const res = await fetch('/api/lecturer/set-code', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || 'Failed to set code');
      }
      
      toast({
        title: 'Attendance Code Set',
        description: `Code "${data.attendanceCode}" has been set for ${result.course.name}.`,
      });
      form.reset();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SetCodeCard isEnabled={isPageEnabled}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-6 w-6 text-primary" /> Set Attendance Code
        </CardTitle>
        <CardDescription>
          Your location has been verified. Set a unique code for students to use for a specific course session.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="courseCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!isPageEnabled}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a course" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {/* In a real app, you would fetch the lecturer's courses */}
                      {MOCK_COURSES.map(course => (
                        <SelectItem key={course.code} value={course.code}>
                          {course.name} ({course.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="attendanceCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Attendance Code</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., CS211NOW" {...field} disabled={!isPageEnabled} />
                  </FormControl>
                  <FormDescription>
                    Students will need to enter this exact code to mark their attendance.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center gap-2 p-2 border rounded-md bg-muted">
                <ShieldCheck className="h-5 w-5 text-green-600" />
                <div className="flex-1">
                    <p className="font-semibold text-green-700">Location Verified</p>
                    {isPageEnabled && (
                        <p className="text-sm text-muted-foreground">
                            Lat: {parseFloat(verifiedLatitude).toFixed(4)}, Lon: {parseFloat(verifiedLongitude).toFixed(4)}
                        </p>
                    )}
                </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading || !isPageEnabled}>
              {isLoading ? 'Setting Code...' : 'Set Code'}
              <Settings2 className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </Form>
      </CardContent>
    </SetCodeCard>
  );
}
