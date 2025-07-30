import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
    return (
        <div className="flex flex-col gap-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-5 w-5 rounded-full" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-7 w-12" />
                            <Skeleton className="mt-1 h-3 w-40" />
                        </CardContent>
                    </Card>
                ))}
            </div>

             <div className="grid gap-6 md:grid-cols-3">
                <Card className="flex flex-col md:col-span-2">
                <CardHeader>
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-3 w-64" />
                </CardHeader>
                <CardContent className="flex-1 flex items-center justify-center">
                   <Skeleton className="h-[250px] w-full" />
                </CardContent>
                </Card>

                <Card>
                <CardHeader>
                    <Skeleton className="h-5 w-32" />
                     <Skeleton className="h-3 w-48" />
                </CardHeader>
                <CardContent className="grid gap-4">
                   {[...Array(4)].map((_, i) => (
                       <Skeleton key={i} className="h-10 w-full" />
                   ))}
                </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-3 w-64" />
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                     <Skeleton className="h-16 w-full" />
                     <Skeleton className="h-16 w-full" />
                </CardContent>
            </Card>
        </div>
    )
}
