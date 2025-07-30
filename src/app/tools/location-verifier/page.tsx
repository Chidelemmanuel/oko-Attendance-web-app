
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Compass, Sparkles, AlertTriangle, MapPin, KeyRound, ClipboardCheck } from 'lucide-react';
import { verifyLocationAction } from './actions';
import type { VerifyAttendanceLocationOutput } from '@/ai/flows/attendance-location-verification';
import { useQuery } from '@tanstack/react-query';

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


export default function LocationVerifierPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(true);
  const [verificationResult, setVerificationResult] = useState<VerifyAttendanceLocationOutput | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: string | null, role: string | null }>({ id: null, role: null });

  const { data: latestClass, isLoading: isLoadingClass } = useQuery<LatestClass | null>({
        queryKey: ['latestClassForTool'],
        queryFn: fetchLatestClass,
        enabled: user.role === 'student'
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
        const id = localStorage.getItem('userIdentifier');
        const role = localStorage.getItem('userRole');
        setUser({ id, role });
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
        setLocationError(`Error getting location: ${error.message}. Please enable location services.`);
        setIsFetchingLocation(false);
      }
    );
  }, []);

  async function handleVerification() {
    if (!currentLocation || !user.id) {
        toast({
            variant: 'destructive',
            title: 'Verification Failed',
            description: 'Could not get your current location or user ID. Please try again.',
        });
        return;
    }

    setIsVerifying(true);
    setVerificationResult(null);

    let expectedLatitude: number;
    let expectedLongitude: number;

    if (user.role === 'lecturer') {
      // For lecturers, verify against their own captured location.
      expectedLatitude = currentLocation.latitude;
      expectedLongitude = currentLocation.longitude;
    } else {
       // For students, use the latest class location
       if (!latestClass) {
         toast({ variant: 'destructive', title: 'Verification Failed', description: 'No active class found to verify against.' });
         setIsVerifying(false);
         return;
       }
       expectedLatitude = latestClass.latitude;
       expectedLongitude = latestClass.longitude;
    }


    const result = await verifyLocationAction({
        studentId: user.id, // Use generic ID field for verification
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        expectedLatitude: expectedLatitude,
        expectedLongitude: expectedLongitude
    });
    
    if ('error' in result) {
      toast({
        variant: 'destructive',
        title: 'Verification Failed',
        description: result.error,
      });
      setIsVerifying(false);
    } else {
      setVerificationResult(result);
      if (result.isOnSiteProbability > 0.7) { // Threshold for allowing progression
         toast({
            title: 'Verification Successful!',
            description: `You can now proceed.`,
         });
         
         if (user.role === 'student') {
             router.push('/attendance/submit');
         } else if (user.role === 'lecturer') {
             router.push('/lecturer/set-code');
         } else {
            setIsVerifying(false);
         }


      } else {
         toast({
            variant: 'destructive',
            title: 'Verification Failed',
            description: `AI determined you are not on-site. Probability: ${(result.isOnSiteProbability * 100).toFixed(0)}%. You cannot proceed.`,
         });
         setIsVerifying(false);
      }
    }
  }
  
  const getActionInfo = () => {
    if(user.role === 'lecturer'){
        return {
            title: 'Verify Your Location',
            description: 'Please verify your current location before setting an attendance code. This ensures accuracy.',
            buttonIcon: KeyRound,
            buttonText: 'Verify & Proceed to Set Code',
        }
    }
    // Default to student
    return {
        title: 'Verify Your Location',
        description: 'Please verify your current location before submitting attendance. This is a required step.',
        buttonIcon: ClipboardCheck,
        buttonText: 'Verify & Proceed to Submit Attendance',
    }
  }

  const actionInfo = getActionInfo();

  const renderStatus = () => {
    const isStudentWaiting = user.role === 'student' && (isLoadingClass || isFetchingLocation);
    const isLecturerWaiting = user.role === 'lecturer' && isFetchingLocation;

    if (isStudentWaiting || isLecturerWaiting) {
        return (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                <p>Acquiring your location...</p>
            </div>
        );
    }
    if (locationError) {
        return (
            <div className="flex flex-col items-center gap-2 text-destructive">
                <AlertTriangle className="h-8 w-8" />
                <p className="text-center">{locationError}</p>
            </div>
        )
    }
    if (user.role === 'student' && !latestClass) {
        return (
             <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Compass className="h-8 w-8" />
                <p className="text-center">No active classes found to verify against right now.</p>
            </div>
        )
    }

    if (currentLocation) {
        return (
            <div className="flex flex-col items-center gap-4">
                 <div className="flex items-center gap-2 p-3 border rounded-lg bg-secondary/50 w-full">
                    <MapPin className="h-6 w-6 text-primary" />
                    <div>
                        <p className="text-sm font-medium">Your Current Location</p>
                        <p className="text-xs text-muted-foreground">
                           Lat: {currentLocation.latitude.toFixed(4)}, Lon: {currentLocation.longitude.toFixed(4)}
                        </p>
                    </div>
                </div>
                 <Button onClick={handleVerification} className="w-full" disabled={isVerifying || !user.id || (user.role === 'student' && !latestClass)}>
                    {isVerifying ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                    <actionInfo.buttonIcon className="mr-2 h-4 w-4" />
                    )}
                    {actionInfo.buttonText}
                </Button>
            </div>
        )
    }
    return null;
  }

  return (
    <div className="space-y-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>{actionInfo.title}</CardTitle>
          <CardDescription>
            {actionInfo.description} Your location will be checked against the lecturer's coordinates for the active class.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center min-h-[150px]">
            {renderStatus()}
        </CardContent>
      </Card>
      {verificationResult && !isVerifying && (
         <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Last Verification Result
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-secondary/30">
                <div>
                    <p className="text-sm text-muted-foreground">On-Site Probability</p>
                    <p className="text-3xl font-bold text-primary">
                        {(verificationResult.isOnSiteProbability * 100).toFixed(0)}%
                    </p>
                </div>
            </div>
            
            {verificationResult.reasoning && (
              <div>
                <h4 className="font-semibold mb-1">AI Reasoning:</h4>
                <p className="text-sm text-muted-foreground p-3 border rounded-md bg-muted">
                  {verificationResult.reasoning}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
