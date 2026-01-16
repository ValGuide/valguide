import { Skeleton } from '@valguide/ui/components/skeleton'

export function GuidesListLoading() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-40" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton elements
          <div
            key={`skeleton-${i}`}
            className="overflow-hidden rounded-lg border bg-card shadow-[var(--shadow-card)]"
          >
            <Skeleton className="h-44 w-full" />
            {/* CardHeader */}
            <div className="flex flex-col gap-1.5 px-6 pt-6">
              <div className="flex items-start justify-between gap-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-5 w-14 shrink-0 rounded-full" />
              </div>
            </div>
            {/* CardContent */}
            <div className="px-6 py-3 space-y-1.5">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            {/* CardFooter */}
            <div className="flex flex-col gap-3 px-6 pb-6 pt-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
