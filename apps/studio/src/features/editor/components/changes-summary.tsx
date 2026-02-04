import { useTranslations } from '@valguide/core/i18n/client'
import { cn } from '@valguide/ui/lib/utils'

export type ChangesSummaryProps = {
  changedCount: number
  publishedAt: Date | null
  className?: string
}

export function ChangesSummary({ changedCount, publishedAt, className }: ChangesSummaryProps) {
  const t = useTranslations('tours.diff')

  if (changedCount === 0 && publishedAt) {
    return <p className={cn('text-sm text-muted-foreground', className)}>{t('noChanges')}</p>
  }

  if (!publishedAt) {
    return <p className={cn('text-sm text-muted-foreground', className)}>{t('neverPublished')}</p>
  }

  return <p className={cn('text-sm text-muted-foreground', className)}>{t('changesCount', { count: changedCount })}</p>
}
