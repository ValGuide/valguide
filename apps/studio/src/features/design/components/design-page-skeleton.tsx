import { Skeleton } from '@valguide/ui/components/skeleton'

export function DesignPageSkeleton() {
  return (
    <main className="flex flex-col flex-1 min-h-0 p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="mt-1 h-4 w-64" />
      </div>
      <div className="flex-1 min-h-0">
        <div className="hidden lg:grid lg:grid-cols-[minmax(0,1.4fr)_minmax(380px,0.8fr)] gap-6 w-full flex-1 min-h-0">
          <Skeleton className="h-[500px] rounded-lg" />
          <Skeleton className="h-[500px] rounded-lg" />
        </div>
        <div className="lg:hidden space-y-4">
          <Skeleton className="h-[300px] rounded-lg" />
          <Skeleton className="h-[300px] rounded-lg" />
        </div>
      </div>
    </main>
  )
}
