import { Skeleton } from '@valguide/ui/components/skeleton'

export function AssetsListSkeleton() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-9 w-40" />
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {[...Array(10)].map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton elements
            <div key={`skeleton-${i}`} className="space-y-2">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-5 w-12 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
