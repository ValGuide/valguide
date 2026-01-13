import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@valguide/ui/components/sidebar'
import { Skeleton } from '@valguide/ui/components/skeleton'

export function AppSidebarSkeleton() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <Skeleton className="size-8 rounded-lg" />
              <div className="grid flex-1 text-left text-sm leading-tight gap-1 group-data-[collapsible=icon]:hidden">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-12" />
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {Array.from({ length: 6 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton array that never reorders
            <SidebarMenuItem key={i}>
              <SidebarMenuButton className="gap-2">
                <Skeleton className="size-4" />
                <Skeleton className="h-4 w-24 group-data-[collapsible=icon]:hidden" />
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <div className="grid flex-1 text-left text-sm leading-tight gap-1 group-data-[collapsible=icon]:hidden">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
