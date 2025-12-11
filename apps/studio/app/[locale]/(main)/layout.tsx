import { Separator } from '@valguide/ui/components/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@valguide/ui/components/sidebar'
import { cookies } from 'next/headers'
import { AppSidebarContainer } from '@/components/app-sidebar-container'
import { ThemeSwitcher } from '@/components/theme-switcher'

export default async function Layout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const sidebarState = cookieStore.get('sidebar_state')?.value
  const defaultOpen = sidebarState !== 'false'

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebarContainer />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4 flex-1">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
          </div>
          <div className="flex items-center gap-2 px-4">
            <ThemeSwitcher />
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
