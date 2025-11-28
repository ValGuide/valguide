import { Card, CardContent } from '@valguide/ui/components/card'
import { Skeleton } from '@valguide/ui/components/skeleton'

export default function GuideEditLoading() {
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
          <div className="mx-auto max-w-4xl p-8 space-y-6">
            {/* Guide Details Header */}
            <div>
              <Skeleton className="h-6 w-32 mb-4" />
              {/* Locale Tabs */}
              <div className="flex gap-2">
                <Skeleton className="h-9 w-12" />
                <Skeleton className="h-9 w-12" />
                <Skeleton className="h-9 w-12" />
              </div>
            </div>

            {/* Guide Metadata Form */}
            <Card>
              <CardContent className="p-6 space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-3 w-28" />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  {/* Toolbar */}
                  <div className="flex gap-1">
                    {[...Array(8)].map((_, i) => (
                      // biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton array
                      <Skeleton key={i} className="h-8 w-8" />
                    ))}
                  </div>
                  <Skeleton className="h-32 w-full" />
                </div>

                {/* Cover Image */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </CardContent>
            </Card>

            {/* Stops Section */}
            <div>
              <Skeleton className="h-5 w-16 mb-4" />
              <Card>
                <CardContent className="p-8 flex flex-col items-center justify-center">
                  <Skeleton className="h-12 w-12 rounded-full mb-4" />
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-4 w-64 mb-4" />
                  <Skeleton className="h-9 w-32" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 border-l bg-background p-6">
          <Skeleton className="h-5 w-32 mb-4" />
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-8" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
            <div className="space-y-2 pt-2">
              {[...Array(5)].map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton array
                <div key={i} className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-36" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
