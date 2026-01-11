import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getCookie } from '@tanstack/react-start/server'
import { ensureDefaultTeamQueryOptions } from '@valguide/core/features/orgs/query-options'
import { Separator } from '@valguide/ui/components/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@valguide/ui/components/sidebar'
import { AppSidebarContainer } from '../components/app-sidebar-container'
import { sidebarQueryOptions } from '../features/sidebar/query-options'

const getSidebarStateFn = createServerFn({ method: 'GET' }).handler(() => {
  const sidebarState = getCookie('sidebar_state')
  return sidebarState !== 'false'
})

export const Route = createFileRoute('/_main')({
  beforeLoad: async ({ context, location }) => {
    if (!context.user) {
      throw redirect({
        to: '/login',
        search: { next: location.href },
      })
    }

    // FIRST: Ensure user has at least one team (cached after first call)
    await context.queryClient.ensureQueryData(ensureDefaultTeamQueryOptions())
  },
  loader: async ({ context }) => {
    // THEN: Load sidebar data (team now guaranteed to exist)
    const [sidebarState] = await Promise.all([
      getSidebarStateFn(),
      context.queryClient.ensureQueryData(sidebarQueryOptions()),
    ])
    return sidebarState
  },
  component: MainLayout,
})

function MainLayout() {
  const defaultOpen = Route.useLoaderData()

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
