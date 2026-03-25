import { Card, CardContent, CardHeader } from '@valguide/ui/components/card'
import { Skeleton } from '@valguide/ui/components/skeleton'

export function TourEditSkeleton() {
  return (
    <div className="bg-background pb-16 sm:pb-0">
      <div className="sticky top-0 z-10 border-b bg-background sm:hidden">
        <div className="flex items-center justify-between gap-2 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-sm" />
            <Skeleton className="h-5 w-28" />
          </div>
          <div className="flex h-11 min-w-0 max-w-36 items-center gap-2 rounded-md border bg-background px-3 shadow-xs">
            <Skeleton className="h-4 w-4 shrink-0 rounded-full" />
            <Skeleton className="h-5 min-w-0 flex-1" />
            <Skeleton className="h-4 w-4 shrink-0 rounded-sm" />
          </div>
        </div>
        <div className="flex flex-col gap-1 px-4 pb-3">
          <Skeleton className="h-8 w-60" />
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
        <div className="mx-auto w-full max-w-4xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
          <div className="space-y-6 sm:space-y-8">
            <Skeleton className="h-6 w-64 sm:h-6" />

            <Card className="rounded-2xl">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-8 w-40" />
                      <Skeleton className="h-7 w-10" />
                    </div>
                    <Skeleton className="h-5 w-full max-w-60" />
                    <Skeleton className="h-5 w-28 sm:hidden" />
                  </div>
                  <Skeleton className="hidden h-8 w-20 rounded-md sm:block" />
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-14" />
                  <div className="flex h-11 items-center rounded-xl border bg-background px-4">
                    <Skeleton className="h-5 w-56 max-w-full" />
                  </div>
                  <Skeleton className="h-5 w-28" />
                </div>

                <div className="space-y-2">
                  <Skeleton className="h-5 w-24" />
                  <div className="overflow-hidden rounded-xl border bg-background">
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-4 border-b px-4 py-4">
                      <Skeleton className="h-5 w-4" />
                      <Skeleton className="h-5 w-4" />
                      <Skeleton className="h-5 w-4" />
                      <Skeleton className="h-5 w-6" />
                      <Skeleton className="h-5 w-6" />
                      <Skeleton className="h-5 w-6" />
                      <Skeleton className="h-5 w-6" />
                      <Skeleton className="h-5 w-5" />
                      <Skeleton className="h-5 w-5" />
                    </div>
                    <div className="space-y-3 px-4 py-4">
                      <Skeleton className="h-4 w-[92%]" />
                      <Skeleton className="h-4 w-[84%]" />
                      <Skeleton className="h-4 w-[72%]" />
                      <Skeleton className="h-28 w-full rounded-lg" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-5 w-40" />
                </div>
                <Skeleton className="h-4 w-full max-w-72" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <div className="rounded-lg border bg-background p-3">
                    <Skeleton className="aspect-[16/8] w-full rounded-md" />
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-9 w-28 rounded-md" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-5 w-28" />
                </div>
                <Skeleton className="h-4 w-full max-w-64" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full rounded-md" />
                <div className="flex items-center justify-between gap-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </CardContent>
            </Card>

            <div>
              <Skeleton className="mb-4 h-5 w-14" />
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton array
                  <div key={i} className="rounded-lg border bg-card p-4">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <Skeleton className="h-5 w-5 shrink-0" />
                      <Skeleton className="h-16 w-16 shrink-0 rounded-lg" />
                      <div className="min-w-0 flex-1 space-y-2">
                        <Skeleton className="h-5 w-full max-w-40" />
                        {i === 1 ? <Skeleton className="h-4 w-16" /> : null}
                      </div>
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
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background p-3 sm:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-10 flex-1 items-center justify-center rounded-xl border bg-background px-4">
            <Skeleton className="h-5 w-12" />
          </div>
          <div className="flex h-10 flex-1 items-center justify-center rounded-xl border bg-background px-4">
            <Skeleton className="h-5 w-14" />
          </div>
        </div>
      </div>
    </div>
  )
}
