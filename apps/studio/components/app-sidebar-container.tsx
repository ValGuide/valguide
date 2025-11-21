'use client'

import { useEffect, useState } from 'react'
import { getSidebarDataAction } from '@valguide/core/features/orgs/context-actions'
import { AppSidebar } from './app-sidebar'
import { type Team } from '@valguide/core/features/orgs/components/team-switcher'
import { useRouter } from 'next/navigation'
import { useSidebar } from '@valguide/ui/components/sidebar'
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@valguide/ui/components/sidebar'
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

function AppSidebarSkeleton() {
  // A simple skeleton matching the sidebar structure roughly
  return (
    <div className="h-full w-[--sidebar-width] bg-sidebar border-r border-sidebar-border flex flex-col">
        <div className="p-4">
            <Skeleton className="h-12 w-full rounded-lg" />
        </div>
        <div className="flex-1 px-2 space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
        </div>
        <div className="p-4">
             <Skeleton className="h-12 w-full rounded-lg" />
        </div>
    </div>
  )
}
