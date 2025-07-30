
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Users, CheckSquare, MapPin, BarChart3, AlertTriangle, ShieldCheck, ClipboardCheck, UserCheck, Briefcase } from "lucide-react";
import { MonthlyAttendanceChart } from "@/components/charts/monthly-attendance-chart";
import { useQuery } from "@tanstack/react-query";
import { DashboardSkeleton } from "@/components/skeletons/dashboard-skeleton";

type DashboardStats = {
  totalStudents: number;
  averageAttendance: number;
  todayPresent: number;
  flaggedLocations: number;
};

async function fetchDashboardStats(): Promise<DashboardStats> {
  const res = await fetch('/api/dashboard/stats');
  if (!res.ok) {
    throw new Error('Failed to fetch dashboard stats');
  }
  return res.json();
}

export default function DashboardPage() {

  const { data: stats, isLoading, isError } = useQuery<DashboardStats>({
    queryKey: ['dashboardStats'],
    queryFn: fetchDashboardStats,
  });

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isError || !stats) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold">Failed to Load Dashboard</h2>
        <p className="text-muted-foreground">There was an error fetching the dashboard data. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">Registered in the system</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Attendance</CardTitle>
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageAttendance}%</div>
            <p className="text-xs text-muted-foreground">Across all courses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today&apos;s Present</CardTitle>
            <CheckSquare className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayPresent}</div>
            <p className="text-xs text-muted-foreground">Students marked present today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flagged Locations</CardTitle>
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.flaggedLocations}</div>
            <p className="text-xs text-muted-foreground">Attendance records needing review</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="flex flex-col md:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Attendance Trend</CardTitle>
            <CardDescription>Attendance percentage over the last 6 months (mock data).</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <MonthlyAttendanceChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Access core features quickly.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Link href="/students" passHref>
              <Button variant="outline" className="w-full justify-start gap-2">
                <Users className="h-5 w-5" /> Student Lookup
              </Button>
            </Link>
            <Link href="/attendance/submit" passHref>
              <Button variant="outline" className="w-full justify-start gap-2">
                <ClipboardCheck className="h-5 w-5" /> Submit Attendance
              </Button>
            </Link>
            <Link href="/tools/location-verifier" passHref>
              <Button variant="outline" className="w-full justify-start gap-2">
                <MapPin className="h-5 w-5" /> Location Verifier Tool
              </Button>
            </Link>
            <Button variant="outline" className="w-full justify-start gap-2" disabled>
              <ShieldCheck className="h-5 w-5" /> View Security Logs
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
