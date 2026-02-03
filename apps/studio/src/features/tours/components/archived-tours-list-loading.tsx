import { Skeleton } from '@valguide/ui/components/skeleton'

export function ArchivedToursListLoading() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(3)].map((_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton elements
        <div key={`skeleton-${i}`} className="overflow-hidden rounded-lg border bg-card shadow-(--shadow-card)">
          <Skeleton className="h-44 w-full" />
          <div className="flex flex-col gap-1.5 px-6 pt-6">
            <div className="flex items-start justify-between gap-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-5 w-20 shrink-0 rounded-full" />
            </div>
          </div>
          <div className="space-y-1.5 px-6 py-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <div className="flex flex-col gap-3 px-6 pb-6 pt-2">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
            <Skeleton className="h-3 w-36" />
          </div>
        </div>
      ))}
    </div>
  )
}
