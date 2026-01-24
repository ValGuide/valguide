import { useTranslations } from '@valguide/core/i18n/client'
import { Button } from '@valguide/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@valguide/ui/components/dialog'
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="min-w-0">
          <DialogHeader>
            <DialogTitle>{t('title')}</DialogTitle>
            <DialogDescription>{t('description')}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
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
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={isLoading || !feedback.trim()}>
              {isLoading && <Loader2 className="size-4 mr-2 animate-spin" />}
              {t('submit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
