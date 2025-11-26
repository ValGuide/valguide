'use client'

import { signOutAction } from '@valguide/core/features/auth/actions'
import { switchTeamAction } from '@valguide/core/features/orgs/context-actions'
import { unlocalizedPathname } from '@valguide/core/i18n/route.utils'
import { useTranslations } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { mutate } from 'swr'
import { AppSidebar } from './app-sidebar'
import { AppSidebarSkeleton } from './app-sidebar-skeleton'
import { useSidebarData } from '../features/sidebar/hooks/use-sidebar-data'

export function AppSidebarContainer() {
  const pathname = usePathname()
  const router = useRouter()
  const t = useTranslations('orgs.teamSwitcher')

  const { data, isLoading, mutate: mutateSidebar } = useSidebarData()

  useEffect(() => {
    if (data?.wasAutoSelected) {
      router.refresh()
    }
  }, [data?.wasAutoSelected, router])

  useEffect(() => {
    if (!isLoading && data && !data.currentTeam) {
      const currentPath = unlocalizedPathname(pathname)
      if (currentPath !== '/team') {
        const locale = pathname.split('/')[1]
        router.push(`/${locale}/team`)
      }
    }
  }, [isLoading, data, pathname, router])

  const handleTeamSwitch = async (teamSlug: string) => {
    try {
      const result = await switchTeamAction(teamSlug)
      if (result?.success) {
        // Refresh data locally
        await mutateSidebar()
        // Refresh server components (if any rely on cookie)
        router.refresh()
        // Invalidate guides cache to force reload
        await mutate('/api/guides')
        // Show success
        toast.success(t('success'))
      }
    } catch (error) {
      console.error(error)
      toast.error(t('error'))
    }
  }

  const handleLogout = async () => {
    await signOutAction({ scope: 'global' })
    router.refresh()
  }

  if (isLoading) {
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
      onLogout={handleLogout}
    />
  )
}
