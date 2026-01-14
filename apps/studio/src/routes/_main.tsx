import { MainLayoutPending } from '@/components/main-layout-pending'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { ensureDefaultTeamQueryOptions } from '@valguide/core/features/orgs/query-options'
import { isAuthenticatedQueryOptions } from '@valguide/features/auth/query-options'
import { Separator } from '@valguide/ui/components/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@valguide/ui/components/sidebar'
import { Skeleton } from '@valguide/ui/components/skeleton'
import { Suspense } from 'react'
import { AppSidebarContainer } from '../components/app-sidebar-container'
import { sidebarStateQueryOptions } from '../features/sidebar/query-options'

export const Route = createFileRoute('/_main')({
  beforeLoad: async ({ context, location }) => {
    const isAuthenticated = await context.queryClient.ensureQueryData(isAuthenticatedQueryOptions())
    if (!isAuthenticated) {
      throw redirect({
        to: '/login',
        search: { next: location.href },
      })
    }

    // FIRST: Ensure user has at least one team (cached after first call)
    await context.queryClient.ensureQueryData(ensureDefaultTeamQueryOptions())
    const sidebarState = await context.queryClient.ensureQueryData(sidebarStateQueryOptions())
    return { defaultOpen: sidebarState }
  },
  loader: async ({ context }) => {

    // TODO: really needed?
    // All data fetched via ensureQueryData - enables instant navigation after first load
    context.queryClient.ensureQueryData(sidebarStateQueryOptions())

  },
  component: MainLayout,
  pendingComponent: MainLayoutPending
})

function MainLayout() {
  const { defaultOpen } = Route.useRouteContext()

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebarContainer />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex flex-1 items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
          </div>
        </header>
        <Suspense fallback={<ContentSkeleton />}>
          <Outlet />
        </Suspense>
      </SidebarInset>
    </SidebarProvider>
  )
}

function ContentSkeleton() {
  return (
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
            <div key={i} className="overflow-hidden rounded-xl border bg-card">
              <Skeleton className="h-48 w-full" />
              <div className="flex flex-col space-y-1.5 p-6">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
