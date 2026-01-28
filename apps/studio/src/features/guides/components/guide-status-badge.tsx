import { useTranslations } from '@valguide/core/i18n/client'
import { cn } from '@valguide/ui/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'

const guideStatusBadgeVariants = cva(
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

export type GuideStatus = 'published' | 'unpublished' | 'archived'
export type GuideIndicator = 'up-to-date' | 'changed' | null

export interface GuideStatusBadgeProps extends VariantProps<typeof guideStatusBadgeVariants> {
  status: GuideStatus
  indicator?: GuideIndicator
  className?: string
}

const statusEmoji: Record<GuideStatus, string> = {
  published: '🟢',
  unpublished: '⚪',
  archived: '⚫',
}

export function GuideStatusBadge({ status, indicator, size, className }: GuideStatusBadgeProps) {
  const tStatus = useTranslations('guides.status')
  const tIndicator = useTranslations('guides.indicator')

  const emoji = statusEmoji[status]
  const statusLabel = tStatus(status)
  const showIndicator = status === 'published' && indicator

  return (
    <span className={cn(guideStatusBadgeVariants({ status, size }), className)}>
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
