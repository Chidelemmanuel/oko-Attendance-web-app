
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
import { KeyRound, Settings2, ShieldCheck, MapPin, Loader2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { MOCK_COURSES } from '@/lib/mock-data';

const setCodeSchema = z.object({
  courseCode: z.string().min(1, { message: 'Please select a course.' }),
  attendanceCode: z.string().min(4, { message: 'Code must be at least 4 characters.' }).max(10, {message: "Code must be at most 10 characters."}),
  latitude: z.number({ required_error: 'Location is required.'}),
  longitude: z.number({ required_error: 'Location is required.'}),
});

type SetCodeFormValues = z.infer<typeof setCodeSchema>;


function AccessDenied() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ShieldAlert className="h-6 w-6 text-destructive" />
                    Access Denied
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">You do not have permission to view this page. This area is restricted to lecturers only.</p>
            </CardContent>
        </Card>
    )
}

export default function SetAttendanceCodePage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isLecturer, setIsLecturer] = useState<boolean | null>(null);


  const form = useForm<SetCodeFormValues>({
    resolver: zodResolver(setCodeSchema),
    defaultValues: {
      courseCode: '',
      attendanceCode: '',
    },
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
        const role = localStorage.getItem('userRole');
        setIsLecturer(role === 'lecturer');
    }
  }, []);

  useEffect(() => {
    if (!isLecturer) return; // Only fetch location if user is a lecturer

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
        setLocationError(null);
        setIsFetchingLocation(false);
      },
      (error) => {
        setLocationError(`Error getting location: ${error.message}. Please enable location services.`);
        setIsFetchingLocation(false);
      },
      { enableHighAccuracy: true }
    );
  }, [form, isLecturer]);


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
        description: `Code "${data.attendanceCode}" for ${result.course.name} is now active.`,
      });
      form.reset({ courseCode: data.courseCode, attendanceCode: ''});

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
  
  const isFormEnabled = !isFetchingLocation && !locationError;

  const renderLocationStatus = () => {
    if (isFetchingLocation) {
        return (
             <div className="flex items-center gap-2 p-2 border rounded-md bg-muted text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <p className="font-semibold">Acquiring your location...</p>
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
                    <p className="font-semibold text-green-700">Location Captured and Ready</p>
                    <p className="text-sm text-muted-foreground">
                        Lat: {currentLocation.latitude.toFixed(4)}, Lon: {currentLocation.longitude.toFixed(4)}
                    </p>
                </div>
            </div>
        )
    }
    return null;
  }
  
  if (isLecturer === null) {
    return null; // Or a full page loader
  }
  
  if (!isLecturer) {
    return <AccessDenied />;
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-6 w-6 text-primary" /> Set Attendance Code
        </CardTitle>
        <CardDescription>
          Your current location will be captured and saved for this class session. Set a unique code for students to use.
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
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!isFormEnabled}>
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
                    <Input placeholder="e.g., CS211NOW" {...field} disabled={!isFormEnabled} />
                  </FormControl>
                  <FormDescription>
                    Students will need to enter this exact code to mark their attendance.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {renderLocationStatus()}

            <Button type="submit" className="w-full" disabled={isLoading || !isFormEnabled}>
              {isLoading ? 'Setting Code...' : 'Set Code & Activate Class'}
              <Settings2 className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
