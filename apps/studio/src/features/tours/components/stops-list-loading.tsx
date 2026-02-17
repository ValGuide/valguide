import { Card, CardContent } from '@valguide/ui/components/card'
import { Skeleton } from '@valguide/ui/components/skeleton'

export function StopsListLoading() {
  return (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton elements
        <Card key={`skeleton-${i}`}>
          <CardContent className="flex items-center gap-4 p-4">
            <Skeleton className="h-5 w-5 shrink-0" />
            <Skeleton className="h-16 w-16 shrink-0 rounded-lg" />
            <div className="flex-1 min-w-0">
              <Skeleton className="h-5 w-40" />
            </div>
            <div className="flex items-center gap-1">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-8" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
