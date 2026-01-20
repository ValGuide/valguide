import { Skeleton } from '@valguide/ui/components/skeleton'
import { ListPageHeaderSkeleton } from '@/components/list-page-header'

export function StopsListSkeleton() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <ListPageHeaderSkeleton />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton elements
            <div key={`skeleton-${i}`} className="rounded-lg border bg-card p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
