'use client'

import { useEffect, useState } from 'react'
import { getSidebarDataAction, switchTeamAction } from '@valguide/core/features/orgs/context-actions'
import { AppSidebar } from './app-sidebar'
import { type Team } from '@valguide/core/features/orgs/components/team-switcher'
import { useRouter, usePathname } from 'next/navigation'
import { unlocalizedPathname } from '@valguide/core/i18n/route.utils'
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
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'

export function AppSidebarContainer() {
  const pathname = usePathname()
  const router = useRouter()
  const t = useTranslations('orgs.teamSwitcher')
  const [data, setData] = useState<{
    user: { name: string; email: string; avatar: string }
    teams: Team[]
    currentTeam: Team | undefined
  } | null>(null)
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    const res = await getSidebarDataAction()
    if (!res) {
      setLoading(false)
      return
    }
    
    if (res.wasAutoSelected) {
      router.refresh()
    }

    setData(res)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (!loading && data && !data.currentTeam) {
      const currentPath = unlocalizedPathname(pathname)
      if (currentPath !== '/team') {
        const locale = pathname.split('/')[1]
        router.push(`/${locale}/team`)
      }
    }
  }, [loading, data, pathname, router])

  const handleTeamSwitch = async (teamSlug: string) => {
    try {
      const result = await switchTeamAction(teamSlug)
      if (result?.success) {
        // Refresh data locally
        await loadData()
        // Refresh server components (if any rely on cookie)
        router.refresh()
        // Show success
        toast.success(t('success'))
      }
    } catch (error) {
      console.error(error)
      toast.error(t('error'))
    }
  }

  if (loading) {
    return <AppSidebarSkeleton />
  }

  if (!data) {
    return null 
  }

  return (
    <AppSidebar
      user={data.user}
      teams={data.teams}
      currentTeam={data.currentTeam}
      onTeamSwitch={handleTeamSwitch}
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
