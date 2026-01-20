import { Skeleton } from '@valguide/ui/components/skeleton'

export function StopsListLoading() {
  return (
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
  )
}
