import { Skeleton } from '@valguide/ui/components/skeleton'

export function StopStandaloneEditSkeleton() {
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-background px-6 py-3">
        <Skeleton className="h-8 w-64" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Center Panel */}
        <div className="flex-1 overflow-y-auto bg-muted/50">
          <div className="mx-auto max-w-4xl space-y-6 p-8">
            {/* Back Button */}
            <Skeleton className="h-8 w-40" />

            {/* Locale Tabs */}
            <div className="flex gap-2">
              <Skeleton className="h-9 w-12" />
              <Skeleton className="h-9 w-12" />
              <Skeleton className="h-9 w-12" />
            </div>

            {/* Stop Editor Form */}
            <div className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>

              {/* Audio */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-32 w-full rounded-lg" />
                <Skeleton className="h-4 w-36" />
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

              {/* Gallery */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-4 w-36" />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 border-t pt-6">
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-24" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="hidden w-80 border-l bg-background p-6 lg:block">
          <Skeleton className="mb-4 h-5 w-32" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    </div>
  )
}
