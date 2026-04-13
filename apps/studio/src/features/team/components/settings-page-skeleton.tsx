import { Skeleton } from '@valguide/ui/components/skeleton'
import { ListPageHeaderSkeleton } from '@/components/list-page-header'

export function SettingsPageSkeleton() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40 rounded-full" />
          <Skeleton className="h-4 w-full max-w-xl rounded-full" />
        </div>
        <div className="space-y-6">
          <section className="rounded-xl border p-6">
            <ListPageHeaderSkeleton />
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Skeleton className="h-10 rounded-lg" />
              <Skeleton className="h-10 rounded-lg" />
              <Skeleton className="h-28 rounded-lg sm:col-span-2" />
            </div>
          </section>
          <section className="rounded-xl border p-6">
            <ListPageHeaderSkeleton hasAction />
            <div className="mt-6 space-y-3">
              <Skeleton className="h-12 rounded-lg" />
              <Skeleton className="h-12 rounded-lg" />
              <Skeleton className="h-12 rounded-lg" />
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
