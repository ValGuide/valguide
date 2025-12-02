'use client'

import { signOutAction } from '@valguide/core/features/auth/actions'
import { createTeamAction } from '@valguide/core/features/orgs/actions'
import { switchTeamAction } from '@valguide/core/features/orgs/context-actions'
import { unlocalizedPathname } from '@valguide/core/i18n/route.utils'
import { usePathname, useRouter } from '@valguide/i18n/routing'
import { useTranslations } from 'next-intl'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { mutate } from 'swr'
import { useSidebarData } from '../features/sidebar/hooks/use-sidebar-data'
import { AppSidebar } from './app-sidebar'
import { AppSidebarSkeleton } from './app-sidebar-skeleton'

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
        // Full page reload to ensure all state is reset
        window.location.reload()
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
      onCreateTeam={createTeamAction}
    />
  )
}
