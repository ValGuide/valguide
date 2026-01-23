import { Card, CardContent, CardHeader } from '@valguide/ui/components/card'
import { Skeleton } from '@valguide/ui/components/skeleton'

export function GuideEditSkeleton() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background pb-16 sm:pb-0">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b bg-background px-4 py-2 sm:px-6 sm:py-3">
        {/* Mobile/Tablet: Wrapping flex layout */}
        <div className="flex flex-wrap items-center justify-end gap-2 lg:hidden">
          <Skeleton className="h-8 w-30" /> {/* Locale selector */}
          <Skeleton className="h-8 w-8" /> {/* Three dots menu */}
          <Skeleton className="h-8 w-8" /> {/* Checklist button */}
          {/* Inline save/publish on tablet */}
          <Skeleton className="hidden h-8 w-16 sm:block" /> {/* Save */}
          <Skeleton className="hidden h-8 w-20 sm:block" /> {/* Publish */}
        </div>
        {/* Desktop: Single row with breadcrumb */}
        <div className="hidden lg:flex items-center justify-between gap-2">
          <Skeleton className="h-5 w-64" /> {/* Breadcrumb */}
          <div className="flex shrink-0 items-center gap-2">
            <Skeleton className="h-8 w-30" /> {/* Locale selector */}
            <Skeleton className="h-8 w-16" /> {/* Preview button */}
          </div>
        </div>
      </div>

      {/* Status Badge and Tabs */}
      <div className="sticky top-14.25 z-10 border-b bg-background px-4 py-3 sm:px-6">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <Skeleton className="h-6 w-48 sm:h-7 sm:w-64" /> {/* Title */}
            <Skeleton className="h-5 w-16 shrink-0" /> {/* Status badge */}
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-20" /> {/* Draft tab */}
            <Skeleton className="h-9 w-24" /> {/* Published tab */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex min-w-0">
        <div className="min-w-0 flex-1 bg-muted/30 dark:bg-background">
          <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <div className="space-y-6 sm:space-y-8">
              {/* Locale-specific Content Header */}
              <div className="flex items-center justify-between gap-4">
                <Skeleton className="h-5 w-40 sm:h-6" />
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

              {/* Shared Content Section */}
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

              {/* Stops Section */}
              <div>
                <Skeleton className="mb-4 h-5 w-16" />
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8">
                  <Skeleton className="mb-4 h-12 w-12 rounded-full" />
                  <Skeleton className="mb-2 h-5 w-32" />
                  <Skeleton className="mb-4 h-4 w-64" />
                  <Skeleton className="h-9 w-32" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Actions Panel (Desktop only) */}
        <aside className="hidden w-72 shrink-0 border-l bg-background lg:block self-start sticky top-35">
          <div className="p-5 space-y-6">
            {/* Editor Actions Panel */}
            <div className="space-y-3">
              <Skeleton className="h-9 w-full" /> {/* Save button */}
              <Skeleton className="h-9 w-full" /> {/* Publish button */}
              <div className="flex gap-2 pt-2">
                <Skeleton className="h-8 w-full" /> {/* Unpublish */}
                <Skeleton className="h-8 w-full" /> {/* Discard */}
              </div>
            </div>

            <div className="border-t pt-5">
              <Skeleton className="mb-4 h-4 w-24" /> {/* Guide Progress header */}
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
        </aside>
      </div>

      {/* Mobile Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background p-3 sm:hidden">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 flex-1" /> {/* Save button */}
          <Skeleton className="h-8 flex-1" /> {/* Publish button */}
        </div>
      </div>
    </div>
  )
}
