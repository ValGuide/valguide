import { Skeleton } from '@valguide/ui/components/skeleton'
import { ListPageHeaderSkeleton } from '@/components/list-page-header'

export function DesignPageSkeleton() {
  return (
    <main className="flex min-h-0 flex-1 flex-col p-4 pt-0">
      <div className="mx-auto flex min-h-0 w-full max-w-[96rem] flex-1 flex-col space-y-6">
        <ListPageHeaderSkeleton />
        <div className="flex-1 min-h-0">
          <div className="hidden w-full min-h-0 flex-1 gap-8 xl:grid xl:grid-cols-[minmax(0,1.45fr)_minmax(440px,0.9fr)]">
            <Skeleton className="h-[500px] rounded-lg" />
            <Skeleton className="h-[500px] rounded-lg" />
          </div>
          <div className="space-y-4 xl:hidden">
            <Skeleton className="h-[380px] rounded-xl" />
            <Skeleton className="h-28 rounded-t-xl" />
          </div>
        </div>
      </div>
    </main>
  )
}
