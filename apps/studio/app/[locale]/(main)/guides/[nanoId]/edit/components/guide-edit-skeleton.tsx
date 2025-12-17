import { Card, CardContent, CardHeader } from '@valguide/ui/components/card'
import { Skeleton } from '@valguide/ui/components/skeleton'

export function GuideEditSkeleton() {
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col overflow-x-hidden bg-background">
      {/* Header */}
      <div className="border-b bg-background px-3 py-3 sm:px-6">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <Skeleton className="hidden h-5 w-64 lg:block" />
          <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
            <Skeleton className="h-8 w-8 sm:w-24" />
            <Skeleton className="h-8 w-8 sm:w-20" />
            <Skeleton className="h-8 w-8 lg:hidden" />
            <Skeleton className="hidden h-8 w-20 lg:block" />
            <Skeleton className="h-8 w-8 lg:hidden" />
            <Skeleton className="h-8 w-16 sm:w-20" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex min-w-0 flex-1 overflow-hidden">
        <div className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-background">
          <div className="mx-auto w-full max-w-4xl p-4 sm:p-6 lg:p-8">
            <div className="space-y-6">
              {/* Global Assets Section (Shared Content) */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-5 w-48" />
                  </div>
                  <Skeleton className="h-4 w-72" />
                </CardHeader>
                <CardContent>
                  {/* Cover Image Picker */}
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </CardContent>
              </Card>

              {/* Locale-specific Content Header */}
              <div className="flex items-center justify-between gap-4">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-9 w-[180px]" />
              </div>

              {/* Guide Metadata Form Card */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-28" />
                    <Skeleton className="h-4 w-10" />
                  </div>
                  <Skeleton className="h-4 w-56" />
                </CardHeader>
                <CardContent className="space-y-6">
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
                </CardContent>
              </Card>

              {/* Stops Section */}
              <div>
                <Skeleton className="mb-4 h-5 w-16" />
                <Card>
                  <CardContent className="flex flex-col items-center justify-center p-8">
                    <Skeleton className="mb-4 h-12 w-12 rounded-full" />
                    <Skeleton className="mb-2 h-5 w-32" />
                    <Skeleton className="mb-4 h-4 w-64" />
                    <Skeleton className="h-9 w-32" />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="hidden w-80 shrink-0 border-l bg-background p-6 lg:block">
          <Skeleton className="mb-4 h-5 w-32" />
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
