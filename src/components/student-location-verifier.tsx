
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Compass, Sparkles, AlertTriangle, MapPin, CheckCircle, XCircle, ClipboardCheck } from 'lucide-react';
import { verifyLocationAction } from '@/app/tools/location-verifier/actions';
import type { VerifyAttendanceLocationOutput } from '@/ai/flows/attendance-location-verification';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from './ui/skeleton';
import Link from 'next/link';

type LatestClass = {
    courseCode: string;
    latitude: number;
    longitude: number;
};

async function fetchLatestClass(): Promise<LatestClass | null> {
    const res = await fetch('/api/dashboard/latest-class');
    if (res.status === 404) {
        return null;
    }
    if (!res.ok) {
        throw new Error('Failed to fetch latest class');
    }
    return res.json();
}

export function StudentLocationVerifier() {
    const { toast } = useToast();
    const [isVerifying, setIsVerifying] = useState(false);
    const [isFetchingLocation, setIsFetchingLocation] = useState(true);
    const [verificationResult, setVerificationResult] = useState<VerifyAttendanceLocationOutput | null>(null);
    const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [user, setUser] = useState<{ id: string | null }>({ id: null });
    
    const { data: latestClass, isLoading: isLoadingClass, isError: isErrorClass } = useQuery<LatestClass | null>({
        queryKey: ['latestClass'],
        queryFn: fetchLatestClass,
        refetchOnWindowFocus: false,
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const id = localStorage.getItem('userIdentifier');
            setUser({ id });
        }
    }, []);

    useEffect(() => {
        if (!navigator.geolocation) {
            setLocationError('Geolocation is not supported by your browser.');
            setIsFetchingLocation(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setCurrentLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
                setLocationError(null);
                setIsFetchingLocation(false);
            },
            (error) => {
                setLocationError(`Error getting location: ${error.message}.`);
                setIsFetchingLocation(false);
            }
        );
    }, []);

    useEffect(() => {
        if (currentLocation && latestClass && user.id && !verificationResult && !isVerifying) {
            handleVerification();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentLocation, latestClass, user.id]);

    async function handleVerification() {
        if (!currentLocation || !user.id || !latestClass) {
            return;
        }

        setIsVerifying(true);
        setVerificationResult(null);

        const result = await verifyLocationAction({
            studentId: user.id,
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            expectedLatitude: latestClass.latitude,
            expectedLongitude: latestClass.longitude
        });
        
        if ('error' in result) {
            toast({
                variant: 'destructive',
                title: 'Verification Failed',
                description: result.error,
            });
        } else {
            setVerificationResult(result);
        }
        setIsVerifying(false);
    }
    
    const renderStatus = () => {
        if (isLoadingClass || isFetchingLocation) {
            return <div className="flex items-center gap-2"><Loader2 className="h-5 w-5 animate-spin" /><p>Getting status...</p></div>
        }
        if (isErrorClass) {
            return <div className="flex items-center gap-2 text-destructive"><AlertTriangle className="h-5 w-5" /><p>Could not fetch class data.</p></div>
        }
        if (locationError) {
             return <div className="flex items-center gap-2 text-destructive"><AlertTriangle className="h-5 w-5" /><p>{locationError}</p></div>
        }
        if (!latestClass) {
            return <div className="flex items-center gap-2 text-muted-foreground"><Compass className="h-5 w-5" /><p>No active classes found right now.</p></div>
        }

        if (isVerifying) {
            return <div className="flex items-center gap-2"><Loader2 className="h-5 w-5 animate-spin" /><p>Verifying your location for {latestClass.courseCode}...</p></div>
        }

        if(verificationResult) {
            const isOnSite = verificationResult.isOnSiteProbability > 0.5;
            return (
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
                    <div className="flex-1 flex items-center gap-3">
                        {isOnSite ? <CheckCircle className="h-8 w-8 text-green-500" /> : <XCircle className="h-8 w-8 text-destructive" />}
                        <div>
                            <p className={`font-semibold ${isOnSite ? 'text-green-600' : 'text-destructive'}`}>
                                {isOnSite ? `Verified for ${latestClass.courseCode}` : `Not Verified for ${latestClass.courseCode}`}
                            </p>
                            <p className="text-sm text-muted-foreground">{verificationResult.reasoning}</p>
                        </div>
                    </div>
                    <Link href="/attendance/submit" passHref>
                        <Button disabled={!isOnSite}>
                            <ClipboardCheck className="mr-2 h-4 w-4" />
                            Submit Attendance
                        </Button>
                    </Link>
                </div>
            )
        }
        
        return <div className="flex items-center gap-2 text-muted-foreground"><p>Ready to verify for {latestClass.courseCode}.</p></div>;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Live Location Status</CardTitle>
                <CardDescription>Your location is checked automatically against active classes.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center min-h-[60px]">
                {renderStatus()}
            </CardContent>
        </Card>
    );
}

