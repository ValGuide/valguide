import { Skeleton } from '@valguide/ui/components/skeleton'

export function ThemeBrandPageSkeleton() {
  return (
    <main className="flex min-h-0 flex-1 flex-col bg-background">
      <div className="sticky top-0 z-10 border-b bg-background sm:hidden">
        <div className="flex h-14 items-center gap-3 px-4">
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton className="h-5 w-32 rounded-full" />
        </div>
      </div>

      <div className="hidden border-b bg-background sm:block">
        <div className="mx-auto flex w-full max-w-[96rem] flex-col gap-2 px-4 py-4 sm:px-6">
          <Skeleton className="h-5 w-32 rounded-full" />
          <Skeleton className="h-9 w-56 rounded-full" />
          <Skeleton className="h-4 w-full max-w-xl rounded-full" />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden px-4 py-3 sm:px-6 sm:py-6">
        <div className="mx-auto flex h-full min-h-0 w-full max-w-[96rem] flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1.45fr)_minmax(0,24rem)] lg:gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,27rem)] xl:gap-8">
          <div className="flex min-h-0 flex-col gap-4 lg:hidden">
            <Skeleton className="h-4 w-3/4 max-w-sm self-center rounded-full sm:hidden" />
            <Skeleton className="h-[clamp(22rem,58vw,34rem)] rounded-2xl" />
            <Skeleton className="h-28 rounded-[1.4rem]" />
          </div>

          <div className="hidden min-h-0 lg:flex">
            <Skeleton className="h-full min-h-[34rem] w-full rounded-2xl" />
          </div>

          <div className="hidden min-h-0 lg:flex">
            <Skeleton className="h-full min-h-[34rem] w-full rounded-2xl" />
          </div>
        </div>
      </div>
    </main>
  )
}
