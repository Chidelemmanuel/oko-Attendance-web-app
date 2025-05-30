import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Users, CheckSquare, MapPin, BarChart3, AlertTriangle, ShieldCheck } from "lucide-react";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, LabelList } from "recharts";
import { OVERALL_STATS } from "@/lib/mock-data";

const chartData = [
  { month: "January", attendance: 85 },
  { month: "February", attendance: 88 },
  { month: "March", attendance: 92 },
  { month: "April", attendance: 89 },
  { month: "May", attendance: 91 },
  { month: "June", attendance: OVERALL_STATS.averageAttendance },
];

const chartConfig = {
  attendance: {
    label: "Attendance (%)",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{OVERALL_STATS.totalStudents}</div>
            <p className="text-xs text-muted-foreground">Registered in the system</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Attendance</CardTitle>
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{OVERALL_STATS.averageAttendance}%</div>
            <p className="text-xs text-muted-foreground">Across all courses this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today&apos;s Present</CardTitle>
            <CheckSquare className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{OVERALL_STATS.todayPresent}</div>
            <p className="text-xs text-muted-foreground">Students marked present today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flagged Locations</CardTitle>
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{OVERALL_STATS.flaggedLocations}</div>
            <p className="text-xs text-muted-foreground">Attendance records needing review</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Monthly Attendance Trend</CardTitle>
            <CardDescription>Attendance percentage over the last 6 months.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 0, left: -20, bottom: 5 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} unit="%" />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                  <Bar dataKey="attendance" fill="var(--color-attendance)" radius={8}>
                     <LabelList
                        position="top"
                        offset={8}
                        className="fill-foreground"
                        fontSize={12}
                        formatter={(value: number) => `${value}%`}
                      />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
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