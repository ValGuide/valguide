import { useTranslations } from '@valguide/core/i18n/client'
import { cn } from '@valguide/ui/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'

const visibilityBadgeVariants = cva(
  'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full font-medium leading-none transition-colors',
  {
    variants: {
      status: {
        published: 'bg-success text-success-foreground',
        unpublished: 'border border-primary text-primary bg-transparent',
        archived: 'bg-muted text-muted-foreground',
      },
      size: {
        sm: 'min-h-5 px-2 py-1 text-xs',
        md: 'min-h-6 px-2.5 py-1 text-xs',
        lg: 'min-h-7 px-3 py-1.5 text-sm',
      },
    },
    defaultVariants: {
      status: 'unpublished',
      size: 'md',
    },
  },
)

const changesBadgeVariants = cva(
  'inline-flex items-center whitespace-nowrap rounded-full border border-border bg-transparent font-medium leading-none text-muted-foreground',
  {
    variants: {
      size: {
        sm: 'min-h-5 px-2 py-1 text-xs',
        md: 'min-h-6 px-2 py-1 text-xs',
        lg: 'min-h-7 px-2.5 py-1.5 text-sm',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
)

const dotSize: Record<string, string> = {
  sm: 'h-1.5 w-1.5',
  md: 'h-1.5 w-1.5',
  lg: 'h-2 w-2',
}

export type TourStatus = 'published' | 'unpublished' | 'archived'
export type TourIndicator = 'up-to-date' | 'changed' | null

export interface TourStatusBadgeProps extends VariantProps<typeof visibilityBadgeVariants> {
  status: TourStatus
  indicator?: TourIndicator
  className?: string
}

const dotColor: Record<TourStatus, string> = {
  published: 'bg-success-foreground/90',
  unpublished: 'bg-primary',
  archived: 'bg-muted-foreground',
}

export function TourStatusBadge({ status, indicator, size = 'md', className }: TourStatusBadgeProps) {
  // i18n-used-keys: tours.visibility.live, tours.visibility.notLive, tours.visibility.archived
  const tVisibility = useTranslations('tours.visibility')
  // i18n-used-keys: tours.edits.unpublishedEdits
  const tEdits = useTranslations('tours.edits')

  const visibilityLabel =
    status === 'published'
      ? tVisibility('live')
      : status === 'unpublished'
        ? tVisibility('notLive')
        : tVisibility('archived')

  const hasUnpublishedEdits = status === 'published' && indicator === 'changed'
  const sizeKey = size ?? 'md'

  return (
    <span className={cn('inline-flex flex-wrap items-center gap-2', className)}>
      <span className={visibilityBadgeVariants({ status, size })}>
        <span aria-hidden="true" className={cn('inline-block rounded-full', dotSize[sizeKey], dotColor[status])} />
        <span>{visibilityLabel}</span>
      </span>

      {hasUnpublishedEdits && <span className={changesBadgeVariants({ size })}>{tEdits('unpublishedEdits')}</span>}
    </span>
  )
}
