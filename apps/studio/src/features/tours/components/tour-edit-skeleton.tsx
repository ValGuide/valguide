import { Card, CardContent, CardHeader } from '@valguide/ui/components/card'
import { Skeleton } from '@valguide/ui/components/skeleton'

export function TourEditSkeleton() {
  return (
    <div className="bg-background pb-16 sm:pb-0">
      <div className="sticky top-0 z-10 border-b bg-background sm:hidden">
        <div className="flex items-center justify-between gap-2 px-4 py-3">
          <Skeleton className="h-8 w-28" />
          <div className="flex shrink-0 items-center gap-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
        <div className="flex flex-col gap-1 px-4 pb-3">
          <Skeleton className="h-7 w-52" />
        </div>
      </div>

      <div className="sticky top-0 z-10 hidden h-14 items-center border-b bg-background px-4 sm:flex sm:px-6">
        <div className="flex w-full items-center justify-between gap-2">
          <Skeleton className="h-8 w-28" />
          <div className="flex shrink-0 items-center gap-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      </div>

      <div className="sticky top-14 z-10 hidden bg-background px-4 py-3 sm:block sm:px-6">
        <Skeleton className="h-7 w-64" />
      </div>

      <div className="bg-muted/30 dark:bg-background">
        <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="space-y-6 sm:space-y-8">
            <div className="flex items-center justify-between gap-4">
              <Skeleton className="h-5 w-44 sm:h-6" />
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-28" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                    <Skeleton className="h-4 w-56" />
                  </div>
                  <Skeleton className="h-8 w-28" />
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-3 w-28" />
                </div>

                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-40 w-full" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-5 w-40" />
                </div>
                <Skeleton className="h-4 w-72" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="aspect-[16/7] w-full rounded-lg" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-5 w-28" />
                </div>
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-9 w-24" />
              </CardContent>
            </Card>

            <div>
              <Skeleton className="mb-4 h-5 w-16" />
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton array
                  <div key={i} className="rounded-lg border bg-card p-4">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-5 w-5 shrink-0" />
                      <Skeleton className="h-16 w-16 shrink-0 rounded-lg" />
                      <Skeleton className="h-5 flex-1" />
                      <div className="hidden items-center gap-1 sm:flex">
                        <Skeleton className="h-8 w-16" />
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="h-8 w-8" />
                      </div>
                      <div className="flex items-center gap-1 sm:hidden">
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-8" />
                      </div>
                    </div>
                  </div>
                ))}
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background p-3 sm:hidden">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 flex-1" />
          <Skeleton className="h-8 flex-1" />
        </div>
      </div>
    </div>
  )
}
