import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { signOutFn } from '@valguide/core/features/auth/sign-out.fn'
import { submitFeedbackFn } from '@valguide/core/features/feedback/submit-feedback.fn'
import { createTeamFn } from '@valguide/core/features/orgs/create-team.fn'
import { switchTeamFn } from '@valguide/core/features/orgs/switch-team.fn'
import { useTranslations } from '@valguide/core/i18n/client'
import { toast } from '@valguide/core/ui/components/sonner/state'
import { valguideId } from '@valguide/core/utils/nanoid'
import { useEffect, useState } from 'react'
import { uploadFile } from '../features/assets/lib/tus-upload'
import { FeedbackDialog } from '../features/feedback/components/feedback-dialog'
import { useSidebarData } from '../features/sidebar/hooks/use-sidebar-data'
import { AppSidebar } from './app-sidebar'
import { AppSidebarSkeleton } from './app-sidebar-skeleton'

const mimeToExt: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

export function AppSidebarContainer() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const t = useTranslations('orgs.teamSwitcher')
  const tFeedback = useTranslations('sidebar.feedback')

  const { data, isLoading } = useSidebarData()
  const signOut = useServerFn(signOutFn)
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [feedbackLoading, setFeedbackLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const tScreenshot = useTranslations('sidebar.feedback.screenshot')

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

  const handleFeedbackSubmit = async (feedback: string, file: File | null, pageUrl: string) => {
    setFeedbackLoading(true)
    setUploadProgress(0)
    setUploadError(null)

    try {
      let screenshotPath: string | undefined
      let fileName: string | undefined
      let fileSize: number | undefined
      let mimeType: 'image/png' | 'image/jpeg' | 'image/webp' | 'image/gif' | undefined

      // Upload file to Supabase Storage if provided
      if (file) {
        try {
          const ext = mimeToExt[file.type] ?? file.name.split('.').pop() ?? 'png'
          const feedbackId = valguideId()
          const fileId = valguideId()
          const uniqueFileName = `feedback/${feedbackId}/${fileId}.${ext}`

          const result = await uploadFile({
            key: uniqueFileName,
            file,
            onProgress: setUploadProgress,
          })

          screenshotPath = result.key
          fileName = file.name
          fileSize = file.size
          mimeType = file.type as typeof mimeType
        } catch (uploadErr) {
          // Handle upload-specific errors without failing entire submission
          // Check for timeout vs network error
          const errorMessage =
            uploadErr instanceof Error && uploadErr.message.includes('timeout')
              ? tScreenshot('uploadTimeout')
              : tScreenshot('uploadFailed')

          setUploadError(errorMessage)
          setFeedbackLoading(false)
          setUploadProgress(0)
          // Throw to prevent dialog from closing - allow user to retry or submit without screenshot
          throw new Error(errorMessage)
        }
      }

      // Submit feedback to server (stores in DB + sends to Slack)
      await submitFeedbackFn({
        data: {
          feedback,
          userName: data?.user.name,
          teamName: data?.currentTeam?.name,
          teamNanoId: data?.currentTeam?.nanoId,
          pageUrl,
          screenshotPath,
          fileName,
          fileSize,
          mimeType,
        },
      })
      toast.success(tFeedback('success'))
    } finally {
      setFeedbackLoading(false)
      setUploadProgress(0)
    }
  }

  const handleClearUploadError = () => {
    setUploadError(null)
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
      <FeedbackDialog
        open={feedbackOpen}
        onOpenChange={setFeedbackOpen}
        onSubmit={handleFeedbackSubmit}
        isLoading={feedbackLoading}
        uploadProgress={uploadProgress}
        uploadError={uploadError}
        onClearUploadError={handleClearUploadError}
      />
    </>
  )
}
