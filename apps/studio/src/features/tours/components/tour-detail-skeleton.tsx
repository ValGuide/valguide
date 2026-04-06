import { Card, CardContent } from '@valguide/ui/components/card'
import { Skeleton } from '@valguide/ui/components/skeleton'

export function TourDetailSkeleton() {
  return (
    <main className="flex min-w-0 flex-1 flex-col bg-background">
      <div className="sticky top-0 z-10 border-b bg-background sm:hidden">
        <div className="flex items-center justify-between gap-2 px-4 py-3">
          <Skeleton className="h-8 w-24" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-10" />
            <Skeleton className="h-9 w-10" />
            <Skeleton className="h-9 w-28" />
          </div>
        </div>
        <div className="px-4 pb-3">
          <Skeleton className="h-7 w-full max-w-64" />
        </div>
      </div>

      <div className="sticky top-0 z-10 hidden h-14 items-center border-b bg-background px-4 sm:flex sm:px-6">
        <div className="flex w-full items-center justify-between gap-2">
          <Skeleton className="h-8 w-24" />
          <div className="flex shrink-0 items-center gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-9 w-28" />
          </div>
        </div>
      </div>

      <div className="sticky top-14 z-10 hidden border-b bg-background px-4 py-3 sm:block sm:px-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-6 w-20" />
        </div>
      </div>

      <div className="min-w-0 flex-1 bg-muted/30 dark:bg-background">
        <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-8">
          <Card className="overflow-hidden">
            <Skeleton className="h-48 sm:h-56 w-full" />
            <CardContent className="p-6">
              <Skeleton className="h-5 w-full max-w-lg" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton array
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-6 w-28 mb-4" />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton array
                  <div key={i} className="rounded-lg border bg-muted/20 p-4">
                    <Skeleton className="h-5 w-10 mb-2" />
                    <Skeleton className="h-5 w-3/4 mb-1" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
