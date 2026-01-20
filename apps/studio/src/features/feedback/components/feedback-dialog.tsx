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

export interface FeedbackDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (feedback: string) => Promise<void>
  isLoading?: boolean
}

export function FeedbackDialog({ open, onOpenChange, onSubmit, isLoading = false }: FeedbackDialogProps) {
  const t = useTranslations('sidebar.feedback')
  const [feedback, setFeedback] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setFeedback('')
      setError(null)
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
      await onSubmit(trimmedFeedback)
      onOpenChange(false)
    } catch {
      setError(t('submitError'))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
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
              autoFocus
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
