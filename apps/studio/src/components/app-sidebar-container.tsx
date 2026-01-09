import { useQueryClient } from '@tanstack/react-query'
import { useLocation, useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { signOutFn } from '@valguide/core/features/auth/server-functions'
import { createTeamFn, switchTeamFn } from '@valguide/core/features/orgs/server-functions'
import { useTranslations } from '@valguide/core/i18n/client'
import { unlocalizedPathname } from '@valguide/core/i18n/route.utils'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { useSidebarData } from '../features/sidebar/hooks/use-sidebar-data'
import { AppSidebar } from './app-sidebar'
import { AppSidebarSkeleton } from './app-sidebar-skeleton'

export function AppSidebarContainer() {
  const location = useLocation()
  const pathname = location.pathname
  const router = useRouter()
  const queryClient = useQueryClient()
  const t = useTranslations('orgs.teamSwitcher')

  const { data, isLoading } = useSidebarData()
  const signOut = useServerFn(signOutFn)

  useEffect(() => {
    if (data?.wasAutoSelected) {
      router.invalidate()
    }
  }, [data?.wasAutoSelected, router])

  useEffect(() => {
    if (!isLoading && data && !data.currentTeam) {
      const currentPath = unlocalizedPathname(pathname)
      if (currentPath !== '/team') {
        const locale = pathname.split('/')[1]
        router.navigate({ to: `/${locale}/team` })
      }
    }
  }, [isLoading, data, pathname, router])

  const handleTeamSwitch = async (teamSlug: string) => {
    try {
      const result = await switchTeamFn({ data: { slug: teamSlug } })
      if (result?.success) {
        queryClient.removeQueries({ queryKey: ['sidebar'] })
        window.location.reload()
      }
    } catch (error) {
      console.error(error)
      toast.error(t('error'))
    }
  }

  const handleLogout = async () => {
    await signOut({ data: { scope: 'global' } })
    router.invalidate()
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
      onCreateTeam={async (name: string, slug?: string) => createTeamFn({ data: { name, slug } })}
    />
  )
}
