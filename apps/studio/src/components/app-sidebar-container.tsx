import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { signOutFn } from '@valguide/core/features/auth/server-functions'
import { createTeamFn, switchTeamFn } from '@valguide/core/features/orgs/server-functions'
import { useTranslations } from '@valguide/core/i18n/client'
import { toast } from '@valguide/core/ui/components/sonner/state'
import { useEffect, useState } from 'react'
import { FeedbackDialog } from '../features/feedback/components/feedback-dialog'
import { submitFeedbackFn } from '../features/feedback/server-functions'
import { useSidebarData } from '../features/sidebar/hooks/use-sidebar-data'
import { AppSidebar } from './app-sidebar'
import { AppSidebarSkeleton } from './app-sidebar-skeleton'

export function AppSidebarContainer() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const t = useTranslations('orgs.teamSwitcher')
  const tFeedback = useTranslations('sidebar.feedback')

  const { data, isLoading } = useSidebarData()
  const signOut = useServerFn(signOutFn)
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [feedbackLoading, setFeedbackLoading] = useState(false)

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
      console.error(error)
      toast.error(t('error'))
    }
  }

  const handleLogout = async () => {
    await signOut({ data: { scope: 'global' } })
    router.invalidate()
  }

  const handleFeedbackSubmit = async (feedback: string) => {
    setFeedbackLoading(true)
    try {
      await submitFeedbackFn({
        data: {
          feedback,
          userName: data?.user.name,
          teamName: data?.currentTeam?.name,
          teamNanoId: data?.currentTeam?.nanoId,
        },
      })
      toast.success(tFeedback('success'))
    } finally {
      setFeedbackLoading(false)
    }
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
        onCreateTeam={async (name: string, slug?: string) => createTeamFn({ data: { name, slug } })}
        onFeedback={() => setFeedbackOpen(true)}
      />
      <FeedbackDialog
        open={feedbackOpen}
        onOpenChange={setFeedbackOpen}
        onSubmit={handleFeedbackSubmit}
        isLoading={feedbackLoading}
      />
    </>
  )
}
