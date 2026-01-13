import { Card, CardContent, CardFooter, CardHeader } from '@valguide/ui/components/card'
import { Skeleton } from '@valguide/ui/components/skeleton'

export function ArchivedSkeleton() {
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <Skeleton className="mb-2 h-8 w-48" />
      <Skeleton className="mb-6 h-5 w-72" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton array that never reorders
          <Card key={i} className="flex h-full flex-col overflow-hidden">
            <Skeleton className="h-44 w-full rounded-none" />
            <CardHeader className="pb-0">
              <div className="flex items-start justify-between gap-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-5 w-20 shrink-0" />
              </div>
            </CardHeader>
            <CardContent className="flex-1 py-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="mt-1 h-4 w-2/3" />
            </CardContent>
            <CardFooter className="flex-col items-stretch gap-3 pt-0">
              <div className="flex flex-col gap-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
              <Skeleton className="h-3 w-36" />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
