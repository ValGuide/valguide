import { ClientOnly } from '@tanstack/react-router'
import { Separator } from '@valguide/ui/components/separator'
import { SidebarInset, SidebarProvider } from '@valguide/ui/components/sidebar'
import { Skeleton } from '@valguide/ui/components/skeleton'
import { AppSidebarSkeleton } from './app-sidebar-skeleton'

function getSidebarStateFromCookie(): boolean {
  const match = document.cookie.match(/(?:^|;\s*)sidebar_state=([^;]*)/)
  return match ? match[1] !== 'false' : true
}

function MainLayoutPendingContent() {
  const defaultOpen = getSidebarStateFromCookie()

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebarSkeleton />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex flex-1 items-center gap-2 px-4">
            <Skeleton className="size-7 rounded-md" />
            <Separator orientation="vertical" className="mr-2 h-4" />
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="mx-auto w-full max-w-5xl space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-4 w-64" />
              </div>
              <Skeleton className="h-9 w-40" />
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton elements
                <div key={`skeleton-${i}`} className="overflow-hidden rounded-xl border bg-card">
                  <Skeleton className="h-48 w-full" />
                  <div className="flex flex-col space-y-1.5 p-6">
                    <div className="flex items-start justify-between gap-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-5 w-16 shrink-0" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                  <div className="p-6 pt-0">
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <div className="flex flex-col gap-3 p-6 pt-0">
                    <Skeleton className="h-8 w-28" />
                    <Skeleton className="h-3 w-36" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

export function MainLayoutPending() {
  return (
    <ClientOnly fallback={null}>
      <MainLayoutPendingContent />
    </ClientOnly>
  )
}
