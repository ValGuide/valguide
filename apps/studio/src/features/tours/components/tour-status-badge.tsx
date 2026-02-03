import { useTranslations } from '@valguide/core/i18n/client'
import { cn } from '@valguide/ui/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'

const tourStatusBadgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      status: {
        published: 'bg-success text-success-foreground',
        unpublished: 'border border-primary text-primary bg-transparent',
        archived: 'bg-muted text-muted-foreground',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      status: 'unpublished',
      size: 'md',
    },
  },
)

export type TourStatus = 'published' | 'unpublished' | 'archived'
export type TourIndicator = 'up-to-date' | 'changed' | null

export interface TourStatusBadgeProps extends VariantProps<typeof tourStatusBadgeVariants> {
  status: TourStatus
  indicator?: TourIndicator
  className?: string
}

const statusEmoji: Record<TourStatus, string> = {
  published: '🟢',
  unpublished: '⚪',
  archived: '⚫',
}

export function TourStatusBadge({ status, indicator, size, className }: TourStatusBadgeProps) {
  // i18n-used-keys: tours.status.published, tours.status.unpublished, tours.status.archived
  const tStatus = useTranslations('tours.status')
  // i18n-used-keys: tours.indicator.changed, tours.indicator.up-to-date
  const tIndicator = useTranslations('tours.indicator')

  const emoji = statusEmoji[status]
  const statusLabel = tStatus(status)
  const showIndicator = status === 'published' && indicator

  return (
    <span className={cn(tourStatusBadgeVariants({ status, size }), className)}>
      <span>{emoji}</span>
      <span>{statusLabel}</span>
      {showIndicator && (
        <>
          <span className="opacity-60" aria-hidden="true">
            {'·'}
          </span>
          <span>{tIndicator(indicator)}</span>
        </>
      )}
    </span>
  )
}
