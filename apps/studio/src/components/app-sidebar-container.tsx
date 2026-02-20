import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { signOutFn } from '@valguide/core/features/auth/sign-out.fn'
import { createTeamFn } from '@valguide/core/features/orgs/create-team.fn'
import { switchTeamFn } from '@valguide/core/features/orgs/switch-team.fn'
import { useTranslations } from '@valguide/core/i18n/client'
import { toast } from '@valguide/core/ui/components/sonner/state'
import { useEffect, useState } from 'react'
import { FeedbackDialogContainer } from '../features/feedback/components/feedback-dialog-container'
import { useSidebarData } from '../features/sidebar/hooks/use-sidebar-data'
import { AppSidebar } from './app-sidebar'
import { AppSidebarSkeleton } from './app-sidebar-skeleton'

export function AppSidebarContainer() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const t = useTranslations('orgs.teamSwitcher')

  const { data, isLoading } = useSidebarData()
  const signOut = useServerFn(signOutFn)
  const [feedbackOpen, setFeedbackOpen] = useState(false)

  useEffect(() => {
    if (data?.wasAutoSelected) {
      router.invalidate()
    }
  }, [data?.wasAutoSelected, router])

  const handleTeamSwitch = async (teamId: string) => {
    try {
      const result = await switchTeamFn({ data: { id: teamId } })
      if (result?.success) {
        queryClient.removeQueries({ queryKey: ['sidebar'] })
        window.location.reload()
      }
    } catch (error) {
      console.error('Error switching team:', error)
      toast.error(t('error'))
    }
  }

  const handleLogout = async () => {
    await signOut({ data: { scope: 'global' } })
    queryClient.removeQueries({ queryKey: ['is-authenticated'] })
    queryClient.removeQueries({ queryKey: ['current-user'] })
    await router.invalidate()
    router.navigate({ to: '/login' })
  }

  if (isLoading) {
    return <AppSidebarSkeleton />
  }

  if (!data) {
    return null
  }

  return (
    <>
      <AppSidebar
        user={data.user}
        teams={data.teams}
        currentTeam={data.currentTeam}
        onTeamSwitch={handleTeamSwitch}
        onLogout={handleLogout}
        onCreateTeam={async (name: string) => createTeamFn({ data: { name } })}
        onFeedback={() => setFeedbackOpen(true)}
      />
      <FeedbackDialogContainer
        open={feedbackOpen}
        onOpenChange={setFeedbackOpen}
        userName={data.user.name}
        teamName={data.currentTeam?.name}
        teamNanoId={data.currentTeam?.nanoId}
      />
    </>
  )
}
