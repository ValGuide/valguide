import { Card, CardContent } from '@valguide/ui/components/card'
import { Skeleton } from '@valguide/ui/components/skeleton'

export default function GuideLoading() {
  return (
    <main className="flex flex-1 flex-col bg-gray-50 dark:bg-background">
      {/* Header */}
      <div className="border-b bg-background px-6 py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Skeleton className="h-5 w-28" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-9 w-28" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl p-6 sm:p-8 space-y-6">
          {/* Hero Card */}
          <Card className="overflow-hidden">
            <Skeleton className="h-64 sm:h-80 w-full" />
            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-8 w-3/4 max-w-md" />
                  <Skeleton className="h-5 w-full max-w-lg" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            </CardContent>
          </Card>

          {/* Details Card */}
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton array
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Translations Card */}
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-6 w-28 mb-4" />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton array
                  <div key={i} className="rounded-lg border bg-muted/20 p-4">
                    <Skeleton className="h-5 w-10 mb-2" />
                    <Skeleton className="h-5 w-3/4 mb-1" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
