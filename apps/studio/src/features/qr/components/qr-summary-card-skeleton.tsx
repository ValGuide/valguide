import { Card, CardContent } from '@valguide/ui/components/card'
import { Skeleton } from '@valguide/ui/components/skeleton'

export function QrSummaryCardSkeleton() {
  return (
    <Card>
      <CardContent className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
        <div className="space-y-5">
          <div className="space-y-2">
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-5 w-72 max-w-full" />
          </div>

          <div className="rounded-xl border bg-muted/20 p-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-2/3" />
            </div>

            <Skeleton className="my-4 h-px w-full" />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-7 w-28 rounded-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-28" />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-9 w-28 rounded-md" />
              <Skeleton className="h-9 w-28 rounded-md" />
            </div>
            <Skeleton className="h-9 w-32 rounded-md" />
          </div>
        </div>

        <Skeleton className="h-[108px] w-[108px] rounded-xl" />
      </CardContent>
    </Card>
  )
}
