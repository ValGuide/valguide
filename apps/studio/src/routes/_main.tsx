import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { ensureDefaultTeamQueryOptions } from '@valguide/core/features/orgs/query-options'
import { isAuthenticatedQueryOptions } from '@valguide/features/auth/query-options'
import { Separator } from '@valguide/ui/components/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@valguide/ui/components/sidebar'
import { MainLayoutPending } from '@/components/main-layout-pending'
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
    const team = await context.queryClient.ensureQueryData(ensureDefaultTeamQueryOptions())
    const sidebarState = await context.queryClient.ensureQueryData(sidebarStateQueryOptions())
    return { defaultOpen: sidebarState, team }
  },
  component: MainLayout,
  pendingComponent: MainLayoutPending,
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
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  )
}
