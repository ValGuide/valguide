import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
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
        <div className="flex items-center justify-between px-2 py-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          <Skeleton className="h-7 w-32 px-2 transition-[opacity,width,padding] duration-200 group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:overflow-hidden" />
          <Skeleton className="size-8 shrink-0 rounded-lg" />
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <Skeleton className="size-8 rounded-lg" />
              <div className="grid flex-1 text-left text-sm leading-tight gap-1 group-data-[collapsible=icon]:hidden">
                <Skeleton className="h-4 w-20" />
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="uppercase">
            <Skeleton className="h-3 w-16" />
          </SidebarGroupLabel>
          <SidebarMenu>
            {Array.from({ length: 3 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton array that never reorders
              <SidebarMenuItem key={`content-${i}`}>
                <SidebarMenuButton className="group-data-[collapsible=icon]:justify-center">
                  <Skeleton className="size-4 shrink-0 rounded" />
                  <Skeleton className="h-4 w-16 group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="uppercase">
            <Skeleton className="h-3 w-24" />
          </SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton className="group-data-[collapsible=icon]:justify-center">
                <Skeleton className="size-4 shrink-0 rounded" />
                <Skeleton className="h-4 w-20 group-data-[collapsible=icon]:hidden" />
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="uppercase">
            <Skeleton className="h-3 w-14" />
          </SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton className="group-data-[collapsible=icon]:justify-center">
                <Skeleton className="size-4 shrink-0 rounded" />
                <Skeleton className="h-4 w-14 group-data-[collapsible=icon]:hidden" />
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="uppercase">
            <Skeleton className="h-3 w-16" />
          </SidebarGroupLabel>
          <SidebarMenu>
            {Array.from({ length: 2 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton array that never reorders
              <SidebarMenuItem key={`settings-${i}`}>
                <SidebarMenuButton className="group-data-[collapsible=icon]:justify-center">
                  <Skeleton className="size-4 shrink-0 rounded" />
                  <Skeleton className="h-4 w-20 group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <Skeleton className="size-8 rounded-full" />
              <div className="grid flex-1 text-left text-sm leading-tight gap-1 group-data-[collapsible=icon]:hidden">
                <Skeleton className="h-4 w-20" />
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
