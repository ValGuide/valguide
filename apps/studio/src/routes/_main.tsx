import { MainLayoutPending } from '@/components/main-layout-pending'
import { createFileRoute, Outlet, redirect, useMatches } from '@tanstack/react-router'
import { ensureDefaultTeamQueryOptions } from '@valguide/core/features/orgs/query-options'
import { isAuthenticatedQueryOptions } from '@valguide/features/auth/query-options'
import { Separator } from '@valguide/ui/components/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@valguide/ui/components/sidebar'
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
  const matches = useMatches()

  // Hide top header on focus mode routes - they have their own header
  const isFocusMode = matches.some((match) => match.staticData?.focusMode)

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebarContainer />
      <SidebarInset>
        {!isFocusMode && (
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear">
            <div className="flex flex-1 items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1 md:hidden" />
              <Separator orientation="vertical" className="mr-2 h-4 md:hidden" />
            </div>
          </header>
        )}
        <div className={isFocusMode ? 'min-h-dvh flex flex-col' : 'min-h-[calc(100dvh-4rem)] flex flex-col'}>
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
