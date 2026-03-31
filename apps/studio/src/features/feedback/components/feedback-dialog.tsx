import { useTranslations } from '@valguide/core/i18n/client'
import { Button } from '@valguide/ui/components/button'
import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from '@valguide/ui/components/responsive-dialog'
import { Textarea } from '@valguide/ui/components/textarea'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { ScreenshotInput } from './screenshot-input'

export interface FeedbackDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (feedback: string, file: File | null, pageUrl: string) => Promise<void>
  isLoading?: boolean
  uploadProgress?: number
  /** Error from upload (allows retry without closing dialog) */
  uploadError?: string | null
  /** Clear upload error for retry */
  onClearUploadError?: () => void
}

export function FeedbackDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
  uploadProgress = 0,
  uploadError = null,
  onClearUploadError,
}: FeedbackDialogProps) {
  const t = useTranslations('sidebar.feedback')
  const [feedback, setFeedback] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [pageUrl, setPageUrl] = useState('')

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setFeedback('')
      setError(null)
      setSelectedFile(null)
      setPageUrl(window.location.href)
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const trimmedFeedback = feedback.trim()
    if (!trimmedFeedback) {
      setError(t('feedbackRequired'))
      return
    }

    setError(null)
    try {
      await onSubmit(trimmedFeedback, selectedFile, pageUrl)
      onOpenChange(false)
    } catch {
      setError(t('submitError'))
    }
  }

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange} mobileVariant="full-height">
      <ResponsiveDialogContent className="flex min-h-0 flex-col sm:max-h-[90vh] sm:max-w-md">
        <form onSubmit={handleSubmit} className="flex min-h-0 min-w-0 flex-1 flex-col">
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>{t('title')}</ResponsiveDialogTitle>
            <ResponsiveDialogDescription>{t('description')}</ResponsiveDialogDescription>
          </ResponsiveDialogHeader>

          <ResponsiveDialogBody className="space-y-4 py-4">
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder={t('placeholder')}
              disabled={isLoading}
              rows={5}
              className="max-h-[40vh] resize-none"
              autoFocus
            />

            <ScreenshotInput
              onFileSelect={setSelectedFile}
              disabled={isLoading}
              uploadProgress={uploadProgress}
              isUploading={isLoading && selectedFile !== null}
              uploadError={uploadError}
              onClearError={onClearUploadError}
            />

            {error && <p className="text-sm text-destructive">{error}</p>}
          </ResponsiveDialogBody>

          <ResponsiveDialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={isLoading || !feedback.trim()}>
              {isLoading && <Loader2 className="size-4 mr-2 animate-spin" />}
              {t('submit')}
            </Button>
          </ResponsiveDialogFooter>
        </form>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  )
}
