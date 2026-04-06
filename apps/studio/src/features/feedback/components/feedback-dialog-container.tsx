import { useTranslations } from '@valguide/core/i18n/client'
import { useState } from 'react'
import { FeedbackDialog } from './feedback-dialog'

export const FEEDBACK_UPLOAD_TIMEOUT_ERROR = 'feedback-upload-timeout'
export const FEEDBACK_UPLOAD_FAILED_ERROR = 'feedback-upload-failed'

export interface FeedbackSubmission {
  feedback: string
  file: File | null
  pageUrl: string
}

export interface FeedbackSubmissionControls {
  setUploadProgress: (progress: number) => void
}

interface FeedbackDialogContainerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmitFeedback: (submission: FeedbackSubmission, controls: FeedbackSubmissionControls) => Promise<void>
}

export function FeedbackDialogContainer({ open, onOpenChange, onSubmitFeedback }: FeedbackDialogContainerProps) {
  const tScreenshot = useTranslations('sidebar.feedback.screenshot')

  const [feedbackLoading, setFeedbackLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleFeedbackSubmit = async (feedback: string, file: File | null, pageUrl: string) => {
    setFeedbackLoading(true)
    setUploadProgress(0)
    setUploadError(null)

    try {
      await onSubmitFeedback({ feedback, file, pageUrl }, { setUploadProgress })
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === FEEDBACK_UPLOAD_TIMEOUT_ERROR) {
          setUploadError(tScreenshot('uploadTimeout'))
        } else if (error.message === FEEDBACK_UPLOAD_FAILED_ERROR) {
          setUploadError(tScreenshot('uploadFailed'))
        }
      }

      throw error
    } finally {
      setFeedbackLoading(false)
      setUploadProgress(0)
    }
  }

  const handleClearUploadError = () => {
    setUploadError(null)
  }

  return (
    <FeedbackDialog
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={handleFeedbackSubmit}
      isLoading={feedbackLoading}
      uploadProgress={uploadProgress}
      uploadError={uploadError}
      onClearUploadError={handleClearUploadError}
    />
  )
}
