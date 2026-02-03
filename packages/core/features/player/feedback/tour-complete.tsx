import { useTranslations } from '@valguide/core/i18n/client'
import { CheckCircle2, ExternalLink } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../../../ui/components/button'
import { ShareButton } from './share-button'
import type { VisitorFeedbackData } from './visitor-feedback-form'
import { VisitorFeedbackForm } from './visitor-feedback-form'

type ThankYouSettings = {
  title?: string | null
  buttonLabel?: string | null
  buttonUrl?: string | null
}

type TourCompleteProps = {
  tourTitle: string
  shareUrl: string
  onFeedbackSubmit?: (data: VisitorFeedbackData) => Promise<void>
  thankYou?: ThankYouSettings
}

export function TourComplete({ tourTitle, shareUrl, onFeedbackSubmit, thankYou }: TourCompleteProps) {
  const t = useTranslations('player.tourComplete')
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFeedbackSubmit = async (data: VisitorFeedbackData) => {
    if (!onFeedbackSubmit) return
    setIsSubmitting(true)
    try {
      await onFeedbackSubmit(data)
      setFeedbackSubmitted(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col items-center text-center space-y-6 py-8">
      <div className="rounded-full bg-success/10 p-4">
        <CheckCircle2 className="h-12 w-12 text-success" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">{thankYou?.title ?? t('title')}</h1>
        <p className="text-muted-foreground">{t('message')}</p>
      </div>

      {onFeedbackSubmit && !feedbackSubmitted && (
        <div className="w-full max-w-sm bg-card border rounded-lg p-4">
          <h2 className="text-lg font-medium mb-4">{t('ratePrompt')}</h2>
          <VisitorFeedbackForm onSubmit={handleFeedbackSubmit} isSubmitting={isSubmitting} />
        </div>
      )}

      {feedbackSubmitted && (
        <div className="w-full max-w-sm bg-success/10 border border-success/20 rounded-lg p-4 text-success">
          <p className="font-medium">{t('title')}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
        <ShareButton url={shareUrl} title={tourTitle} />
        {thankYou?.buttonUrl && thankYou?.buttonLabel && (
          <Button asChild variant="default" size="sm">
            <a href={thankYou.buttonUrl} target="_blank" rel="noopener noreferrer">
              {thankYou.buttonLabel}
              <ExternalLink className="h-4 w-4 ml-2" />
            </a>
          </Button>
        )}
      </div>
    </div>
  )
}
