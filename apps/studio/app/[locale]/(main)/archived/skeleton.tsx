import { Skeleton } from '@valguide/ui/components/skeleton'
import { Card, CardContent, CardFooter, CardHeader } from '@valguide/ui/components/card'

export function ArchivedSkeleton() {
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <Skeleton className="mb-6 h-8 w-48 sm:text-3xl" />
      <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="flex flex-col">
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="flex-1">
              <Skeleton className="h-3 w-1/3" />
            </CardContent>
            <CardFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between">
              <Skeleton className="h-9 w-full sm:w-[140px]" />
              <Skeleton className="h-9 w-full sm:w-[160px]" />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
