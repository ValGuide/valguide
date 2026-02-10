import { Separator } from '@valguide/core/ui/components/separator'
import { Card, CardContent, CardHeader } from '@valguide/ui/components/card'
import { Skeleton } from '@valguide/ui/components/skeleton'

export function ProfileSkeleton() {
  return (
    <div className="flex-1 space-y-4 p-6 pt-6 sm:p-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <Skeleton className="h-9 w-32" />
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-24" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Skeleton className="size-16 rounded-full" />
              <div className="flex flex-col gap-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-48" />
                <Skeleton className="mt-1 h-8 w-28" />
              </div>
            </div>
            <Separator />
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            <div className="flex items-center justify-between border-t pt-4">
              <Skeleton className="h-3 w-24" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-28" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-destructive/20">
          <CardHeader>
            <Skeleton className="h-7 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-72 mb-4" />
            <Skeleton className="h-9 w-32" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
