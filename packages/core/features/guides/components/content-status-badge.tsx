import { useTranslations } from '@valguide/core/i18n/client'
import { cn } from '@valguide/ui/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'

const contentStatusBadgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      status: {
        draft: 'border border-primary text-primary bg-transparent',
        published: 'bg-success text-success-foreground',
        modified: 'border border-warning text-warning bg-transparent',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      status: 'draft',
      size: 'md',
    },
  },
)

export type ContentStatus = 'draft' | 'published' | 'modified'

export interface ContentStatusBadgeProps extends VariantProps<typeof contentStatusBadgeVariants> {
  status: ContentStatus
  className?: string
  showLabel?: boolean
}

export function ContentStatusBadge({ status, size, className, showLabel = true }: ContentStatusBadgeProps) {
  const t = useTranslations('guides.contentStatus')

  const label = t(status)

  return <span className={cn(contentStatusBadgeVariants({ status, size }), className)}>{showLabel && label}</span>
}

export function getContentStatus(
  hasDraft: boolean,
  hasPublished: boolean,
  draftDiffersFromPublished?: boolean,
): ContentStatus {
  if (!hasPublished && !hasDraft) {
    return 'draft'
  }
  if (hasPublished && hasDraft && draftDiffersFromPublished !== false) {
    return 'modified'
  }
  if (hasPublished && !hasDraft) {
    return 'published'
  }
  return 'draft'
}
