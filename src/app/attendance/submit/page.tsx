
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
import { Loader2, ShieldCheck, Send, KeyRound, User, AlertTriangle } from 'lucide-react';
import { MOCK_COURSES } from '@/lib/mock-data';

const attendanceSubmissionSchema = z.object({
  studentId: z.string().min(1, { message: 'Student ID is required.' }),
  courseCode: z.string().min(1, { message: 'Course code is required.' }),
  attendanceCode: z.string().min(1, { message: 'Attendance code is required.' }),
  latitude: z.number({ required_error: "Verified location is required." }),
  longitude: z.number({ required_error: "Verified location is required." }),
});

type AttendanceFormValues = z.infer<typeof attendanceSubmissionSchema>;

function AttendanceCard({ children, isEnabled }: { children: React.ReactNode, isEnabled: boolean }) {
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
                        You must verify your location before you can submit attendance.
                        Please go back to the dashboard and click "Submit Attendance" to start the verification process.
                    </p>
                </CardContent>
            </Card>
        );
    }
    return <Card className="max-w-2xl mx-auto">{children}</Card>;
}

export default function SubmitAttendancePage() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [studentInfo, setStudentInfo] = useState<{ id: string | null, fullName: string | null }>({ id: null, fullName: null });
  
  const verifiedLatitude = searchParams.get('lat');
  const verifiedLongitude = searchParams.get('lon');

  const form = useForm<AttendanceFormValues>({
    resolver: zodResolver(attendanceSubmissionSchema),
    defaultValues: {
      studentId: '',
      courseCode: '',
      attendanceCode: '',
      latitude: verifiedLatitude ? parseFloat(verifiedLatitude) : undefined,
      longitude: verifiedLongitude ? parseFloat(verifiedLongitude) : undefined,
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
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');
    if (lat && lon) {
        form.setValue('latitude', parseFloat(lat));
        form.setValue('longitude', parseFloat(lon));
        form.clearErrors('latitude');
        form.clearErrors('longitude');
    }
  }, [searchParams, form]);


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

  const isPageEnabled = !!verifiedLatitude && !!verifiedLongitude;

  return (
    <AttendanceCard isEnabled={isPageEnabled}>
      <CardHeader>
        <CardTitle>Submit Attendance</CardTitle>
        <CardDescription>
          Your location has been verified. Please select your course and enter the attendance code provided by your lecturer.
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
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!isPageEnabled}>
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
                    <Input placeholder="Enter code from lecturer" {...field} disabled={!isPageEnabled}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
                control={form.control}
                name="latitude"
                render={({ field }) => (
                    <FormItem className="hidden">
                        <FormControl>
                           <Input {...field} />
                        </FormControl>
                    </FormItem>
                )}
            />
             <FormField
                control={form.control}
                name="longitude"
                render={({ field }) => (
                    <FormItem className="hidden">
                        <FormControl>
                           <Input {...field} />
                        </FormControl>
                    </FormItem>
                )}
            />


            <Button type="submit" className="w-full" disabled={isSubmitting || !isPageEnabled || !studentInfo.id}>
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
    </AttendanceCard>
  );
}
