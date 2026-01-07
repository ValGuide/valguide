import { Card, CardContent, CardHeader } from '@valguide/ui/components/card'
import { Skeleton } from '@valguide/ui/components/skeleton'

export function ProfileSkeleton() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="flex items-center justify-between space-y-2">
          <Skeleton className="h-9 w-32" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            <Skeleton className="h-10 w-24" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
