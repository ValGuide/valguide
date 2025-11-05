import { Skeleton } from '@valguide/ui/components/skeleton'

export default function GuideLoading() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-5 w-32" />
          <div>
            <Skeleton className="h-9 w-3/4 max-w-2xl" />
            <Skeleton className="h-5 w-full max-w-xl mt-2" />
          </div>
        </div>

        <Skeleton className="aspect-video w-full rounded-lg" />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

