import { Skeleton } from '@valguide/ui/components/skeleton'

export function ToursListLoading() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton elements
        <div
          key={`skeleton-${i}`}
          className="flex h-full flex-col overflow-hidden rounded-lg border bg-card shadow-(--shadow-card)"
        >
          <Skeleton className="h-44 w-full" />
          <div className="flex flex-col gap-1.5 px-6 pt-6">
            <div className="flex items-start justify-between gap-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-16 shrink-0 rounded-full" />
            </div>
          </div>
          <div className="flex-1 px-6 py-3">
            <Skeleton className="h-6 w-full opacity-0" />
          </div>
          <div className="flex flex-col gap-3 px-6 pb-6 pt-0">
            <div className="flex items-center justify-between gap-3">
              <Skeleton className="h-8 w-24 rounded-md" />
              <Skeleton className="h-7 w-7 shrink-0 rounded-md" />
            </div>
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      ))}
    </div>
  )
}
