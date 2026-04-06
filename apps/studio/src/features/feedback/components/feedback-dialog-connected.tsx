import { submitFeedbackFn } from '@valguide/core/features/feedback/submit-feedback.fn'
import { useTranslations } from '@valguide/core/i18n/client'
import { toast } from '@valguide/core/ui/components/sonner/state'
import { valguideId } from '@valguide/core/utils/nanoid'
import { uploadFile } from '../../assets/lib/upload'
import {
  FEEDBACK_UPLOAD_FAILED_ERROR,
  FEEDBACK_UPLOAD_TIMEOUT_ERROR,
  FeedbackDialogContainer,
  type FeedbackSubmission,
  type FeedbackSubmissionControls,
} from './feedback-dialog-container'

const mimeToExt: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

interface FeedbackDialogConnectedProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userName?: string
  teamName?: string
  teamNanoId?: string
}

export function FeedbackDialogConnected({
  open,
  onOpenChange,
  userName,
  teamName,
  teamNanoId,
}: FeedbackDialogConnectedProps) {
  const tFeedback = useTranslations('sidebar.feedback')

  const handleSubmitFeedback = async (submission: FeedbackSubmission, controls: FeedbackSubmissionControls) => {
    let screenshotPath: string | undefined
    let fileName: string | undefined
    let fileSize: number | undefined
    let mimeType: 'image/png' | 'image/jpeg' | 'image/webp' | 'image/gif' | undefined

    if (submission.file) {
      try {
        const ext = mimeToExt[submission.file.type] ?? submission.file.name.split('.').pop() ?? 'png'
        const feedbackId = valguideId()
        const fileId = valguideId()
        const uniqueFileName = `studio-feedback/${feedbackId}/${fileId}.${ext}`

        const result = await uploadFile({
          key: uniqueFileName,
          file: submission.file,
          onProgress: controls.setUploadProgress,
        })

        screenshotPath = result.key
        fileName = submission.file.name
        fileSize = submission.file.size
        mimeType = submission.file.type as typeof mimeType
      } catch (error) {
        if (error instanceof Error && error.message.includes('timeout')) {
          throw new Error(FEEDBACK_UPLOAD_TIMEOUT_ERROR)
        }

        throw new Error(FEEDBACK_UPLOAD_FAILED_ERROR)
      }
    }

    await submitFeedbackFn({
      data: {
        feedback: submission.feedback,
        userName,
        teamName,
        teamNanoId,
        pageUrl: submission.pageUrl,
        screenshotPath,
        fileName,
        fileSize,
        mimeType,
      },
    })

    toast.success(tFeedback('success'))
  }

  return <FeedbackDialogContainer open={open} onOpenChange={onOpenChange} onSubmitFeedback={handleSubmitFeedback} />
}
