'use client';

import { useState, useMemo } from 'react';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getStudentById, getAttendanceByStudentId, MOCK_STUDENTS } from '@/lib/mock-data';
import type { Student, AttendanceRecord, AttendanceStatus } from '@/lib/constants';
import { ATTENDANCE_STATUS_ICON_MAP } from '@/lib/constants';
import { Search, User, CalendarDays, BookOpen, MapPin, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const studentLookupSchema = z.object({
  studentId: z.string().min(1, { message: 'Student ID is required.' }),
});

type StudentLookupFormValues = z.infer<typeof studentLookupSchema>;

export default function StudentLookupPage() {
  const [student, setStudent] = useState<Student | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [notFound, setNotFound] = useState(false);

  const form = useForm<StudentLookupFormValues>({
    resolver: zodResolver(studentLookupSchema),
    defaultValues: {
      studentId: '',
    },
  });

  function onSubmit(data: StudentLookupFormValues) {
    const foundStudent = getStudentById(data.studentId);
    if (foundStudent) {
      setStudent(foundStudent);
      setAttendanceRecords(getAttendanceByStudentId(foundStudent.id));
      setNotFound(false);
    } else {
      setStudent(null);
      setAttendanceRecords([]);
      setNotFound(true);
    }
  }

  const getStatusBadgeVariant = (status: AttendanceStatus) => {
    switch (status) {
      case 'Present':
        return 'default'; // Uses primary color from theme
      case 'Absent':
        return 'destructive';
      case 'Late':
        return 'secondary'; // Consider a yellow/orange variant if theme supports
      case 'Excused':
        return 'outline';
      default:
        return 'outline';
    }
  };
  
  const StatusIcon = ({ status }: { status: AttendanceStatus }) => {
    const IconComponent = ATTENDANCE_STATUS_ICON_MAP[status];
    if (!IconComponent) return null;

    let iconColorClass = '';
    switch (status) {
        case 'Present': iconColorClass = 'text-green-600'; break;
        case 'Absent': iconColorClass = 'text-red-600'; break;
        case 'Late': iconColorClass = 'text-yellow-500'; break;
        case 'Excused': iconColorClass = 'text-blue-500'; break;
    }
    return <IconComponent className={`mr-2 h-4 w-4 ${iconColorClass}`} />;
  };


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Student Lookup</CardTitle>
          <CardDescription>Enter a student ID to view their details and attendance record.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-4 items-end">
              <FormField
                control={form.control}
                name="studentId"
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormLabel>Student ID</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., FPO/CS/001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="h-10">
                <Search className="mr-2 h-4 w-4" /> Search
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {notFound && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center text-muted-foreground">
              <User className="h-12 w-12 mb-2" />
              <p className="text-lg font-semibold">Student Not Found</p>
              <p>No student found with ID: {form.getValues('studentId')}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {student && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={student.avatarUrl || `https://placehold.co/100x100.png`} alt={student.name} data-ai-hint="profile person" />
                <AvatarFallback>{student.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{student.name}</CardTitle>
                <CardDescription className="text-md">
                  {student.id} &bull; {student.department} &bull; {student.level}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <h3 className="text-xl font-semibold mb-4">Attendance Record</h3>
            {attendanceRecords.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead><CalendarDays className="inline-block mr-1 h-4 w-4" />Date</TableHead>
                    <TableHead><BookOpen className="inline-block mr-1 h-4 w-4" />Course</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead><MapPin className="inline-block mr-1 h-4 w-4" />Location</TableHead>
                    <TableHead>Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendanceRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{format(parseISO(record.date), 'MMM d, yyyy')}</TableCell>
                      <TableCell>
                        <div className="font-medium">{record.courseCode}</div>
                        <div className="text-xs text-muted-foreground">{record.courseName}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(record.status)} className="capitalize flex items-center w-fit">
                           <StatusIcon status={record.status} />
                           {record.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {record.verifiedLocation !== undefined && (
                          <div className="flex items-center">
                            {record.verifiedLocation ? (
                              <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500 mr-1" />
                            )}
                            <span>
                              {record.verifiedLocation ? 'Verified' : 'Not Verified'}
                              {record.locationScore && ` (${(record.locationScore * 100).toFixed(0)}%)`}
                            </span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{record.remarks || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <CalendarDays className="h-12 w-12 mx-auto mb-2" />
                <p>No attendance records found for this student.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
       {!student && !notFound && (
         <Card>
            <CardHeader>
                <CardTitle>All Students Overview</CardTitle>
                <CardDescription>List of all registered students. Click on a student or search above.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {MOCK_STUDENTS.map(s => (
                        <Button
                            key={s.id}
                            variant="outline"
                            className="h-auto p-4 flex flex-col items-start text-left gap-2 shadow-sm hover:shadow-md transition-shadow"
                            onClick={() => onSubmit({ studentId: s.id })}
                        >
                            <div className="flex items-center gap-3 w-full">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={s.avatarUrl || `https://placehold.co/80x80.png`} alt={s.name} data-ai-hint="profile person" />
                                    <AvatarFallback>{s.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <p className="font-semibold text-base">{s.name}</p>
                                    <p className="text-xs text-muted-foreground">{s.id}</p>
                                    <p className="text-xs text-muted-foreground">{s.department} - {s.level}</p>
                                </div>
                            </div>
                        </Button>
                    ))}
                </div>
            </CardContent>
         </Card>
       )}
    </div>
  );
}