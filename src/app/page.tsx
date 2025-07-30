
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UserCheck, Briefcase, GraduationCap } from "lucide-react";


export default function LandingPage() {

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] p-4 text-center">
        <GraduationCap className="h-24 w-24 text-primary mb-4" />
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Welcome to OkoAttend</h1>
        <p className="mt-3 mb-8 max-w-2xl text-lg text-muted-foreground">
            The smart, secure, and real-time attendance solution for Federal Polytechnic Oko.
            Please select your portal to login or create an account.
        </p>

      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Access Your Portal</CardTitle>
          <CardDescription>Login or sign up to access your specific features.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Link href="/auth/student/login" passHref>
            <Button variant="default" className="w-full justify-center gap-2 py-8 text-base shadow-lg hover:shadow-xl transition-shadow">
              <UserCheck className="h-6 w-6" /> Student Portal
            </Button>
          </Link>
          <Link href="/auth/lecturer/login" passHref>
            <Button variant="default" className="w-full justify-center gap-2 py-8 text-base shadow-lg hover:shadow-xl transition-shadow">
              <Briefcase className="h-6 w-6" /> Lecturer Portal
            </Button>
          </Link>
        </CardContent>
      </Card>

    </div>
  );
}
