import { Skeleton } from '@valguide/ui/components/skeleton'
import { ListPageHeaderSkeleton } from '@/components/list-page-header'

export function DesignPageSkeleton() {
  return (
    <main className="flex flex-col flex-1 min-h-0 p-4 pt-0">
      <div className="mx-auto flex w-full max-w-5xl flex-1 min-h-0 flex-col space-y-6">
        <ListPageHeaderSkeleton />
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
      </div>
    </main>
  )
}
