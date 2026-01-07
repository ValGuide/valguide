import { createFileRoute, Outlet } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getCookie } from '@tanstack/react-start/server'
import { Separator } from '@valguide/ui/components/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@valguide/ui/components/sidebar'
import { AppSidebarContainer } from '../components/app-sidebar-container'

const getSidebarStateFn = createServerFn({ method: 'GET' }).handler(() => {
  const sidebarState = getCookie('sidebar_state')
  return sidebarState !== 'false'
})

export const Route = createFileRoute('/_main')({
  loader: () => getSidebarStateFn(),
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
