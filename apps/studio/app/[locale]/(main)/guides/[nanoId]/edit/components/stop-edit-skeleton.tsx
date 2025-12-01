import { Card, CardContent } from '@valguide/ui/components/card'
import { Skeleton } from '@valguide/ui/components/skeleton'

export function StopEditSkeleton() {
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-background px-6 py-3">
        <Skeleton className="h-8 w-20" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Center Panel */}
        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-background">
          <div className="mx-auto max-w-4xl space-y-6 p-8">
            {/* Back button */}
            <Skeleton className="h-8 w-32" />

            {/* Locale Tabs */}
            <div className="flex gap-2">
              <Skeleton className="h-9 w-12" />
              <Skeleton className="h-9 w-12" />
              <Skeleton className="h-9 w-12" />
            </div>

            {/* Stop Editor Form */}
            <Card>
              <CardContent className="space-y-6 p-6">
                {/* Title */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-10 w-full" />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <div className="flex gap-1">
                    {[...Array(8)].map((_, i) => (
                      // biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton array
                      <Skeleton key={i} className="h-8 w-8" />
                    ))}
                  </div>
                  <Skeleton className="h-32 w-full" />
                </div>

                {/* Transcription */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-24 w-full" />
                </div>

                {/* Images */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <div className="grid grid-cols-3 gap-4">
                    <Skeleton className="aspect-square w-full rounded-lg" />
                    <Skeleton className="aspect-square w-full rounded-lg" />
                  </div>
                </div>

                {/* Audio */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-14" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="hidden w-80 border-l bg-background p-6 lg:block">
          <Skeleton className="mb-4 h-5 w-28" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    </div>
  )
}
