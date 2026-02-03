import { useTranslations } from '@valguide/core/i18n/client'
import { useState } from 'react'
import { Button } from '../../../ui/components/button'
import { Textarea } from '../../../ui/components/textarea'
import { StarRating } from './star-rating'

export type VisitorFeedbackData = {
  rating: number
  comment: string
}

type VisitorFeedbackFormProps = {
  onSubmit: (data: VisitorFeedbackData) => Promise<void>
  isSubmitting?: boolean
}

export function VisitorFeedbackForm({ onSubmit, isSubmitting = false }: VisitorFeedbackFormProps) {
  const t = useTranslations('player.feedback')
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) return
    await onSubmit({ rating, comment })
  }

  const isValid = rating > 0

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <p className="text-sm font-medium" id="rating-label">
          {t('rateExperience')}
        </p>
        <StarRating value={rating} onChange={setRating} size="lg" ariaLabel={t('rateExperience')} />
      </div>

      <div className="space-y-2">
        <label htmlFor="feedback-comment" className="text-sm font-medium">
          {t('commentLabel')}
        </label>
        <Textarea
          id="feedback-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={t('commentPlaceholder')}
          rows={3}
          maxLength={500}
          disabled={isSubmitting}
        />
        <p className="text-xs text-muted-foreground text-right">
          {t('characterCount', { current: comment.length, max: 500 })}
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={!isValid || isSubmitting}>
        {isSubmitting ? t('submitting') : t('submit')}
      </Button>
    </form>
  )
}
