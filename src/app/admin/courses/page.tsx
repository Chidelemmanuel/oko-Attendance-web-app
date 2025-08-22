
'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle } from "lucide-react";
import { Skeleton } from '@/components/ui/skeleton';

type Course = {
    id: string;
    code: string;
    name: string;
    lecturerName: string;
    lecturerId: string;
};

async function fetchAllCourses(): Promise<Course[]> {
    const res = await fetch('/api/admin/courses');
    if (!res.ok) {
        throw new Error('Failed to fetch courses');
    }
    return res.json();
}

function CoursesSkeleton() {
    return (
        <div className="space-y-4">
            {[...Array(10)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-10 w-full rounded-md" />
                </div>
            ))}
        </div>
    );
}

export default function CourseManagementPage() {
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

    const { data: courses, isLoading, isError } = useQuery<Course[]>({
        queryKey: ['allCourses'],
        queryFn: fetchAllCourses,
        enabled: isAdmin === true,
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const role = localStorage.getItem('userRole');
            setIsAdmin(role === 'admin');
        }
    }, []);
    
    if (isAdmin === null) {
        return <CoursesSkeleton />;
    }

    if (!isAdmin) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Access Denied</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>You do not have permission to view this page.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Course Management</CardTitle>
                <CardDescription>A list of all courses in the system.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading && <CoursesSkeleton />}
                {isError && (
                    <div className="flex flex-col items-center justify-center text-destructive">
                        <AlertTriangle className="h-8 w-8 mb-2" />
                        <p>Failed to load courses.</p>
                    </div>
                )}
                {courses && (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Course Code</TableHead>
                                <TableHead>Course Name</TableHead>
                                <TableHead>Assigned Lecturer</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {courses.map((course) => (
                                <TableRow key={course.id}>
                                    <TableCell className="font-mono">{course.code}</TableCell>
                                    <TableCell className="font-medium">{course.name}</TableCell>
                                    <TableCell>{course.lecturerName}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}
