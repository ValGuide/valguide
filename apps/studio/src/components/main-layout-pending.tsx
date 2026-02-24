import { Separator } from '@valguide/ui/components/separator'
import { SidebarInset, SidebarProvider } from '@valguide/ui/components/sidebar'
import { Skeleton } from '@valguide/ui/components/skeleton'
import { AppSidebarSkeleton } from './app-sidebar-skeleton'

function getSidebarStateFromCookie(): boolean {
  const match = document.cookie.match(/(?:^|;\s*)sidebar_state=([^;]*)/)
  return match ? match[1] !== 'false' : true
}

export function MainLayoutPending() {
  const defaultOpen = getSidebarStateFromCookie()

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebarSkeleton />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex flex-1 items-center gap-2 px-4">
            <Skeleton className="size-7 rounded-md md:hidden" />
            <Separator orientation="vertical" className="mr-2 h-4" />
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 pt-0" />
      </SidebarInset>
    </SidebarProvider>
  )
}
