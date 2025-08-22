
'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Skeleton } from '@/components/ui/skeleton';

type User = {
    id: string;
    identifier: string;
    fullName: string;
    email: string;
    role: 'student' | 'lecturer' | 'admin';
};

async function fetchAllUsers(): Promise<User[]> {
    const res = await fetch('/api/admin/users');
    if (!res.ok) {
        throw new Error('Failed to fetch users');
    }
    return res.json();
}

function UsersSkeleton() {
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

export default function UserManagementPage() {
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

    const { data: users, isLoading, isError } = useQuery<User[]>({
        queryKey: ['allUsers'],
        queryFn: fetchAllUsers,
        enabled: isAdmin === true,
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const role = localStorage.getItem('userRole');
            setIsAdmin(role === 'admin');
        }
    }, []);

    const getRoleBadgeVariant = (role: User['role']) => {
        switch (role) {
            case 'admin': return 'destructive';
            case 'lecturer': return 'secondary';
            case 'student':
            default:
                return 'default';
        }
    };

    if (isAdmin === null) {
        return <UsersSkeleton />;
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
                <CardTitle>User Management</CardTitle>
                <CardDescription>A list of all users in the system.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading && <UsersSkeleton />}
                {isError && (
                    <div className="flex flex-col items-center justify-center text-destructive">
                        <AlertTriangle className="h-8 w-8 mb-2" />
                        <p>Failed to load users.</p>
                    </div>
                )}
                {users && (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Full Name</TableHead>
                                <TableHead>Identifier</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.fullName}</TableCell>
                                    <TableCell>{user.identifier}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <Badge variant={getRoleBadgeVariant(user.role)} className="capitalize">
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}
