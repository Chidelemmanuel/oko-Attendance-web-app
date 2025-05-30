
'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { KeyRound, Settings2 } from 'lucide-react';
import { MOCK_COURSES } from '@/lib/mock-data';

const setCodeSchema = z.object({
  courseCode: z.string().min(1, { message: 'Please select a course.' }),
  attendanceCode: z.string().min(4, { message: 'Code must be at least 4 characters.' }).max(10, {message: "Code must be at most 10 characters."}),
});

type SetCodeFormValues = z.infer<typeof setCodeSchema>;

export default function SetAttendanceCodePage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SetCodeFormValues>({
    resolver: zodResolver(setCodeSchema),
    defaultValues: {
      courseCode: '',
      attendanceCode: '',
    },
  });

  async function onSubmit(data: SetCodeFormValues) {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);

    const courseName = MOCK_COURSES.find(c => c.code === data.courseCode)?.name || data.courseCode;

    toast({
      title: 'Attendance Code Set',
      description: `Code "${data.attendanceCode}" has been set for ${courseName}.`,
    });
    form.reset();
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-6 w-6 text-primary" /> Set Attendance Code
        </CardTitle>
        <CardDescription>
          Set a unique code for students to use when submitting attendance for a specific course session.
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
                  <FormLabel>Attendance Code</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., CS211NOW" {...field} />
                  </FormControl>
                  <FormDescription>
                    Students will need to enter this exact code to mark their attendance.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Setting Code...' : 'Set Code'}
              <Settings2 className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
