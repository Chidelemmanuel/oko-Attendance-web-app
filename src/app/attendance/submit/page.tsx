
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
import { Loader2, ShieldCheck, Send, KeyRound, User, AlertTriangle, MapPin } from 'lucide-react';
import { MOCK_COURSES } from '@/lib/mock-data';

const attendanceSubmissionSchema = z.object({
  studentId: z.string().min(1, { message: 'Student ID is required.' }),
  courseCode: z.string().min(1, { message: 'Course code is required.' }),
  attendanceCode: z.string().min(1, { message: 'Attendance code is required.' }),
  latitude: z.number({ required_error: "Your location must be verified to submit." }),
  longitude: z.number({ required_error: "Your location must be verified to submit." }),
});

type AttendanceFormValues = z.infer<typeof attendanceSubmissionSchema>;

export default function SubmitAttendancePage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [studentInfo, setStudentInfo] = useState<{ id: string | null, fullName: string | null }>({ id: null, fullName: null });
  const [isFetchingLocation, setIsFetchingLocation] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const form = useForm<AttendanceFormValues>({
    resolver: zodResolver(attendanceSubmissionSchema),
    defaultValues: {
      studentId: '',
      courseCode: '',
      attendanceCode: '',
    },
  });

   useEffect(() => {
    if (typeof window !== 'undefined') {
        const id = localStorage.getItem('userIdentifier');
        const fullName = localStorage.getItem('userFullName');
        setStudentInfo({ id, fullName });
        if (id) {
            form.setValue('studentId', id);
        }
    }
  }, [form]);


  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      setIsFetchingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setCurrentLocation(coords);
        form.setValue('latitude', coords.latitude);
        form.setValue('longitude', coords.longitude);
        form.clearErrors('latitude');
        form.clearErrors('longitude');
        setLocationError(null);
        setIsFetchingLocation(false);
      },
      (error) => {
        setLocationError(`Error getting location: ${error.message}. Please enable location services.`);
        setIsFetchingLocation(false);
      }
    );
  }, [form]);


  async function onSubmit(data: AttendanceFormValues) {
    setIsSubmitting(true);
    try {
        const res = await fetch('/api/attendance/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await res.json();

        if(!res.ok) {
            throw new Error(result.message || "Submission failed");
        }

        toast({
          title: 'Attendance Submitted',
          description: result.message,
        });
        form.reset({
            studentId: data.studentId,
            courseCode: '', 
            attendanceCode: ''
        });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
        toast({
            variant: 'destructive',
            title: 'Submission Failed',
            description: errorMessage,
        });
    } finally {
        setIsSubmitting(false);
    }
  }

  const isFormEnabled = !isFetchingLocation && !locationError;

   const renderLocationStatus = () => {
    if (isFetchingLocation) {
        return (
             <div className="flex items-center gap-2 p-2 border rounded-md bg-muted text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <p className="font-semibold">Acquiring your location for verification...</p>
            </div>
        )
    }
    if (locationError) {
         return (
             <div className="flex items-center gap-2 p-2 border rounded-md bg-destructive/10 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                <p className="font-semibold">{locationError}</p>
            </div>
        )
    }
     if (currentLocation) {
        return (
             <div className="flex items-center gap-2 p-2 border rounded-md bg-muted">
                <ShieldCheck className="h-5 w-5 text-green-600" />
                <div className="flex-1">
                    <p className="font-semibold text-green-700">Location Captured</p>
                    <p className="text-sm text-muted-foreground">
                        Lat: {currentLocation.latitude.toFixed(4)}, Lon: {currentLocation.longitude.toFixed(4)}
                    </p>
                </div>
            </div>
        )
    }
    return null;
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Submit Attendance</CardTitle>
        <CardDescription>
          Your location must be verified before you can submit attendance. Please ensure location services are enabled.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {studentInfo.id && studentInfo.fullName && (
                 <FormItem>
                  <FormLabel>Student</FormLabel>
                   <div className="flex items-center gap-2 p-2 border rounded-md bg-muted">
                        <User className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1">
                            <p className="font-semibold">{studentInfo.fullName}</p>
                            <p className="text-sm text-muted-foreground">{studentInfo.id}</p>
                        </div>
                   </div>
                   <FormControl>
                        {/* Hidden input to hold the value for the form */}
                        <Input type="hidden" {...form.register('studentId')} />
                   </FormControl>
                  <FormMessage />
                </FormItem>
            )}

            <FormField
              control={form.control}
              name="courseCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!isFormEnabled}>
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
                    <Input placeholder="Enter code from lecturer" {...field} disabled={!isFormEnabled}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {renderLocationStatus()}
           
            <Button type="submit" className="w-full" disabled={isSubmitting || !isFormEnabled || !studentInfo.id}>
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                 <Send className="mr-2 h-4 w-4" />
              )}
              Submit Attendance
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
