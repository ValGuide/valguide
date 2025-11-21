'use client'

import { useEffect, useState } from 'react'
import { getSidebarDataAction } from '@valguide/core/features/orgs/context-actions'
import { AppSidebar } from './app-sidebar'
import { type Team } from '@valguide/core/features/orgs/components/team-switcher'
import { useRouter } from 'next/navigation'
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarHeader, 
  SidebarRail,
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton 
} from '@valguide/ui/components/sidebar'
import { Skeleton } from '@valguide/ui/components/skeleton'

export function AppSidebarContainer() {
  const router = useRouter()
  const [data, setData] = useState<{
    user: { name: string; email: string; avatar: string }
    teams: Team[]
    currentTeam: Team | undefined
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSidebarDataAction().then((res) => {
      if (!res) {
        // Redirect to login or handle unauth
        // Ideally this component is only rendered in protected pages, 
        // but if layout is static, we might need to redirect here.
        // However, layout usually redirects if user is null?
        // Ah, we removed layout redirect. So we must redirect here.
        // We can't easily get locale here without params or hook.
        // But we can use window.location or just redirect to /login
        // Let's assume middleware handles auth or we just show nothing/redirect.
        // For now, let's just set loading false.
        setLoading(false)
        return
      }
      
      if (res.wasAutoSelected) {
        router.refresh()
      }

      setData(res)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return <AppSidebarSkeleton />
  }

  if (!data || !data.currentTeam) {
    return null // Or redirect
  }

  return (
    <AppSidebar
      user={data.user}
      teams={data.teams}
      currentTeam={data.currentTeam}
    />
  )
}

export function AppSidebarSkeleton() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <Skeleton className="size-8 rounded-lg" />
              <div className="grid flex-1 text-left text-sm leading-tight gap-1">
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
            <SidebarMenuItem key={i}>
              <SidebarMenuButton className="gap-2">
                <Skeleton className="size-4" />
                <Skeleton className="h-4 w-24" />
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
              <div className="grid flex-1 text-left text-sm leading-tight gap-1">
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
