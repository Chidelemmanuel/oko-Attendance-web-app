
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Compass, Sparkles, AlertTriangle, MapPin } from 'lucide-react';
import { verifyLocationAction } from './actions';
import type { VerifyAttendanceLocationOutput } from '@/ai/flows/attendance-location-verification';

// Using a fixed location for the school gate for verification purposes
const EXPECTED_LOCATION = {
    latitude: 6.0224, // Approx. Oko Poly Main Gate
    longitude: 7.0700,
};

export default function LocationVerifierPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(true);
  const [verificationResult, setVerificationResult] = useState<VerifyAttendanceLocationOutput | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [studentId, setStudentId] = useState<string | null>(null);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
        const id = localStorage.getItem('userIdentifier');
        setStudentId(id);
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
    if (!currentLocation || !studentId) {
        toast({
            variant: 'destructive',
            title: 'Verification Failed',
            description: 'Could not get your current location or student ID. Please try again.',
        });
        return;
    }

    setIsVerifying(true);
    setVerificationResult(null);

    const result = await verifyLocationAction({
        studentId: studentId,
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        expectedLatitude: EXPECTED_LOCATION.latitude,
        expectedLongitude: EXPECTED_LOCATION.longitude
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
      if (result.isOnSiteProbability > 0.5) { // Threshold for allowing submission
         toast({
            title: 'Verification Successful!',
            description: `You can now proceed to submit your attendance.`,
         });
         router.push(`/attendance/submit?lat=${currentLocation.latitude}&lon=${currentLocation.longitude}`);
      } else {
         toast({
            variant: 'destructive',
            title: 'Verification Failed',
            description: `AI determined you are not on-site. Probability: ${(result.isOnSiteProbability * 100).toFixed(0)}%. You cannot submit attendance.`,
         });
         setIsVerifying(false);
      }
    }
  }

  const renderStatus = () => {
    if (isFetchingLocation) {
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
                 <Button onClick={handleVerification} className="w-full" disabled={isVerifying}>
                    {isVerifying ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                    <Compass className="mr-2 h-4 w-4" />
                    )}
                    Verify & Proceed to Submit Attendance
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
          <CardTitle>Step 1: Location Verification</CardTitle>
          <CardDescription>
            Before submitting attendance, we must verify you are on-site using AI. 
            Your location will be checked against the school's known coordinates.
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
