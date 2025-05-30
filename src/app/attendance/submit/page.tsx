
'use client';

import { useState, useEffect } from 'react';
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
import { Loader2, MapPin, ShieldCheck, Send, KeyRound } from 'lucide-react';
import { MOCK_STUDENTS, MOCK_COURSES } from '@/lib/mock-data';

const attendanceSubmissionSchema = z.object({
  studentId: z.string().min(1, { message: 'Student ID is required.' }),
  courseCode: z.string().min(1, { message: 'Course code is required.' }),
  attendanceCode: z.string().min(1, { message: 'Attendance code is required.' }),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

type AttendanceFormValues = z.infer<typeof attendanceSubmissionSchema>;

export default function SubmitAttendancePage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  const form = useForm<AttendanceFormValues>({
    resolver: zodResolver(attendanceSubmissionSchema),
    defaultValues: {
      studentId: '',
      courseCode: '',
      attendanceCode: '',
    },
  });

  useEffect(() => {
    if (location) {
      form.setValue('latitude', location.latitude);
      form.setValue('longitude', location.longitude);
    }
  }, [location, form]);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      toast({ variant: "destructive", title: "Location Error", description: "Geolocation is not supported." });
      return;
    }

    setIsFetchingLocation(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setIsFetchingLocation(false);
        toast({ title: "Location Acquired", description: "Your current location has been recorded." });
      },
      (error) => {
        setLocationError(`Error getting location: ${error.message}`);
        toast({ variant: "destructive", title: "Location Error", description: `Could not get location: ${error.message}` });
        setIsFetchingLocation(false);
      }
    );
  };

  async function onSubmit(data: AttendanceFormValues) {
    setIsSubmitting(true);
    // Simulate API call and cryptographic attestation
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock logic: check if student ID exists
    const studentExists = MOCK_STUDENTS.some(s => s.id === data.studentId);
    if (!studentExists) {
        toast({
            variant: 'destructive',
            title: 'Submission Failed',
            description: `Student ID "${data.studentId}" not found. Please check and try again.`,
        });
        setIsSubmitting(false);
        return;
    }
    
    // Mock: In a real app, validate data.attendanceCode against the code set by lecturer
    if (data.attendanceCode.toUpperCase() !== 'OKOATTEND') { // Example mock check
        toast({
            variant: 'destructive',
            title: 'Invalid Code',
            description: 'The attendance code is incorrect. Please check with your lecturer.',
        });
        setIsSubmitting(false);
        return;
    }


    console.log('Attendance Data:', data);
    // In a real app, this data (along with device attestation proof) would be sent to a backend.
    toast({
      title: 'Attendance Submitted',
      description: `Attendance for ${data.studentId} in ${data.courseCode} has been recorded.`,
    });
    form.reset();
    setLocation(null);
    setLocationError(null);
    setIsSubmitting(false);
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Submit Attendance</CardTitle>
        <CardDescription>
          Mark your attendance for a course. Ensure your location services are enabled and you have the attendance code.
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
                    <Input placeholder="Enter your student ID (e.g., FPO/CS/001)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="courseCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a course" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
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
                  <FormLabel className="flex items-center gap-1">
                    <KeyRound className="h-4 w-4" />
                    Attendance Code
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Enter code from lecturer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>Location</FormLabel>
              <div className="flex items-center gap-4">
                <Button type="button" variant="outline" onClick={handleGetLocation} disabled={isFetchingLocation}>
                  {isFetchingLocation ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <MapPin className="mr-2 h-4 w-4" />
                  )}
                  {location ? 'Refresh Location' : 'Get Current Location'}
                </Button>
                {location && (
                  <p className="text-sm text-muted-foreground">
                    Lat: {location.latitude.toFixed(4)}, Lon: {location.longitude.toFixed(4)}
                  </p>
                )}
              </div>
              {locationError && <p className="text-sm font-medium text-destructive">{locationError}</p>}
               <FormDescription>
                Your location will be used to verify on-site presence.
              </FormDescription>
            </FormItem>
            
            <div className="flex items-center p-3 border rounded-md bg-secondary/50">
                <ShieldCheck className="h-6 w-6 mr-3 text-primary" />
                <div>
                    <p className="text-sm font-medium">Secure Submission</p>
                    <p className="text-xs text-muted-foreground">
                        Your attendance is submitted securely using device-generated cryptographic attestation to ensure data integrity.
                    </p>
                </div>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting || !location}>
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                 <Send className="mr-2 h-4 w-4" />
              )}
              Submit Attendance
            </Button>
             {!location && !isFetchingLocation && (
                <p className="text-sm text-center text-destructive">Please acquire your location before submitting.</p>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
