import { createFileRoute, Outlet, redirect, useMatches } from '@tanstack/react-router'
import { protectedSessionBootstrapQueryOptions } from '@valguide/features/auth/query-options'
import { Separator } from '@valguide/ui/components/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@valguide/ui/components/sidebar'
import { StudioPageTransition } from '@/components/studio-page-transition'
import { StudioProductAnalytics } from '@/components/studio-product-analytics'
import { AppSidebarContainer } from '../components/app-sidebar-container'
import { sidebarQueryOptions, sidebarStateQueryOptions } from '../features/sidebar/query-options'

export const Route = createFileRoute('/_main')({
  beforeLoad: async ({ context, location }) => {
    const bootstrap = await context.queryClient.ensureQueryData(protectedSessionBootstrapQueryOptions())

    if (!bootstrap.user) {
      throw redirect({
        to: '/login',
        search: { next: location.href },
      })
    }

    if (bootstrap.status === 'pending') {
      throw redirect({ to: '/pending' })
    }

    if (bootstrap.status === 'blocked' || bootstrap.status === 'deactivated') {
      throw redirect({ to: '/blocked' })
    }

    if (!bootstrap.activeOrgId) {
      throw redirect({ to: '/session-recovery' })
    }

    const [sidebarState, sidebar] = await Promise.all([
      context.queryClient.ensureQueryData(sidebarStateQueryOptions()),
      context.queryClient.ensureQueryData(sidebarQueryOptions()),
    ])

    return {
      defaultOpen: sidebarState,
      currentTeam: sidebar?.currentTeam ?? null,
    }
  },
  component: MainLayout,
})

function MainLayout() {
  const { defaultOpen } = Route.useRouteContext()
  const matches = useMatches()

  // Hide top header on focus mode routes - they have their own header
  const isFocusMode = matches.some((match) => match.staticData?.focusMode)

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <StudioProductAnalytics />
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
          <StudioPageTransition>
            <Outlet />
          </StudioPageTransition>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
