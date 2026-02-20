import { submitFeedbackFn } from '@valguide/core/features/feedback/submit-feedback.fn'
import { useTranslations } from '@valguide/core/i18n/client'
import { toast } from '@valguide/core/ui/components/sonner/state'
import { valguideId } from '@valguide/core/utils/nanoid'
import { useState } from 'react'
import { uploadFile } from '../../assets/lib/upload'
import { FeedbackDialog } from './feedback-dialog'

const mimeToExt: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

interface FeedbackDialogContainerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userName?: string
  teamName?: string
  teamNanoId?: string
}

export function FeedbackDialogContainer({
  open,
  onOpenChange,
  userName,
  teamName,
  teamNanoId,
}: FeedbackDialogContainerProps) {
  const tFeedback = useTranslations('sidebar.feedback')
  const tScreenshot = useTranslations('sidebar.feedback.screenshot')

  const [feedbackLoading, setFeedbackLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleFeedbackSubmit = async (feedback: string, file: File | null, pageUrl: string) => {
    setFeedbackLoading(true)
    setUploadProgress(0)
    setUploadError(null)

    try {
      let screenshotPath: string | undefined
      let fileName: string | undefined
      let fileSize: number | undefined
      let mimeType: 'image/png' | 'image/jpeg' | 'image/webp' | 'image/gif' | undefined

      if (file) {
        try {
          const ext = mimeToExt[file.type] ?? file.name.split('.').pop() ?? 'png'
          const feedbackId = valguideId()
          const fileId = valguideId()
          const uniqueFileName = `studio-feedback/${feedbackId}/${fileId}.${ext}`

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
          const errorMessage =
            uploadErr instanceof Error && uploadErr.message.includes('timeout')
              ? tScreenshot('uploadTimeout')
              : tScreenshot('uploadFailed')

          setUploadError(errorMessage)
          setFeedbackLoading(false)
          setUploadProgress(0)
          throw new Error(errorMessage)
        }
      }

      await submitFeedbackFn({
        data: {
          feedback,
          userName,
          teamName,
          teamNanoId,
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
