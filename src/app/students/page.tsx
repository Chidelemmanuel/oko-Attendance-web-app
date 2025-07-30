'use client';

import { useState, useMemo, useEffect } from 'react';
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
import type { AttendanceRecord, AttendanceStatus } from '@/lib/constants';
import { ATTENDANCE_STATUS_ICON_MAP } from '@/lib/constants';
import { Search, User, CalendarDays, BookOpen, MapPin, CheckCircle, XCircle, AlertCircle, ShieldAlert, Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';


const studentLookupSchema = z.object({
  studentId: z.string().min(1, { message: 'Student ID is required.' }),
});

type StudentLookupFormValues = z.infer<typeof studentLookupSchema>;

// Data types from the backend
type FetchedStudent = {
  id: string;
  studentId: string;
  name: string;
  email: string;
  department?: string;
  level?: string;
};

// --- API Fetching Functions ---
async function fetchStudents(): Promise<FetchedStudent[]> {
    const res = await fetch('/api/students');
    if (!res.ok) throw new Error('Failed to fetch students');
    return res.json();
}

async function fetchAttendance(studentId: string): Promise<AttendanceRecord[]> {
    const res = await fetch(`/api/students/${studentId}/attendance`);
    if (!res.ok) throw new Error('Failed to fetch attendance records');
    return res.json();
}


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

function StudentsListSkeleton() {
    return (
      <Card>
        <CardHeader>
            <CardTitle>All Students Overview</CardTitle>
            <CardDescription>List of all registered students. Click on a student or search above.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-auto p-4 flex flex-col items-start text-left gap-2 rounded-lg border">
                        <div className="flex items-center gap-3 w-full">
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-1/2" />
                                <Skeleton className="h-3 w-1/3" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </CardContent>
     </Card>
    );
}

export default function StudentLookupPage() {
  const [selectedStudent, setSelectedStudent] = useState<FetchedStudent | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLecturer, setIsLecturer] = useState<boolean | null>(null);
  
  const { data: students, isLoading: isLoadingStudents, isError: isErrorStudents } = useQuery<FetchedStudent[]>({
    queryKey: ['students'],
    queryFn: fetchStudents,
  });

  const { data: attendanceRecords, isLoading: isLoadingAttendance } = useQuery<AttendanceRecord[]>({
    queryKey: ['attendance', selectedStudent?.id],
    queryFn: () => fetchAttendance(selectedStudent!.id),
    enabled: !!selectedStudent, // Only fetch attendance if a student is selected
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
        const role = localStorage.getItem('userRole');
        setIsLecturer(role === 'lecturer');
    }
  }, []);


  const filteredStudents = useMemo(() => {
    if (!students) return [];
    if (!searchQuery) return students;
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.studentId.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [students, searchQuery]);

  const form = useForm<StudentLookupFormValues>({
    resolver: zodResolver(studentLookupSchema),
    defaultValues: {
      studentId: '',
    },
  });

  function onSubmit(data: StudentLookupFormValues) {
    setSearchQuery(data.studentId);
    const foundStudent = students?.find(s => s.studentId.toLowerCase() === data.studentId.toLowerCase());
    if(foundStudent) {
        setSelectedStudent(foundStudent);
    } else {
        setSelectedStudent(null);
    }
  }

  const handleStudentSelect = (student: FetchedStudent) => {
    setSelectedStudent(student);
    form.setValue('studentId', student.studentId);
    setSearchQuery(''); // Clear search to show all students again in background if needed
  }

  const getStatusBadgeVariant = (status: AttendanceStatus) => {
    switch (status) {
      case 'Present':
        return 'default';
      case 'Absent':
        return 'destructive';
      case 'Late':
        return 'secondary';
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

  if (isLecturer === null) {
    return null; // Or a full page loader
  }
  
  if (!isLecturer) {
    return <AccessDenied />;
  }

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
                      <Input placeholder="e.g., FPO/CS/001" {...field} onChange={(e) => {
                          field.onChange(e);
                          setSearchQuery(e.target.value);
                      }} />
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

      {searchQuery && filteredStudents.length === 0 && (
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

      {selectedStudent && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={`https://placehold.co/100x100.png`} alt={selectedStudent.name} data-ai-hint="profile person" />
                <AvatarFallback>{selectedStudent.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{selectedStudent.name}</CardTitle>
                <CardDescription className="text-md">
                  {selectedStudent.studentId} &bull; {selectedStudent.email}
                </CardDescription>
                <Button variant="link" className="p-0 h-auto" onClick={() => setSelectedStudent(null)}>Back to student list</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <h3 className="text-xl font-semibold mb-4">Attendance Record</h3>
            {isLoadingAttendance ? (
                <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
                    <p className="mt-2 text-muted-foreground">Loading attendance...</p>
                </div>
            ) : attendanceRecords && attendanceRecords.length > 0 ? (
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
                              {record.locationScore !== undefined && ` (${(record.locationScore * 100).toFixed(0)}%)`}
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
       {!selectedStudent && (
          isLoadingStudents ? <StudentsListSkeleton /> :
          <Card>
            <CardHeader>
                <CardTitle>All Students Overview</CardTitle>
                <CardDescription>List of all registered students. Click on a student or search above.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredStudents.map(s => (
                        <Button
                            key={s.id}
                            variant="outline"
                            className="h-auto p-4 flex flex-col items-start text-left gap-2 shadow-sm hover:shadow-md transition-shadow"
                            onClick={() => handleStudentSelect(s)}
                        >
                            <div className="flex items-center gap-3 w-full">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={`https://placehold.co/80x80.png`} alt={s.name} data-ai-hint="profile person" />
                                    <AvatarFallback>{s.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <p className="font-semibold text-base">{s.name}</p>
                                    <p className="text-xs text-muted-foreground">{s.studentId}</p>
                                    <p className="text-xs text-muted-foreground">{s.email}</p>
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
