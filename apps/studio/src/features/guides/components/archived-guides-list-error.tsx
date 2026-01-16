import { useTranslations } from '@valguide/core/i18n/client'
import { Button } from '@valguide/ui/components/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@valguide/ui/components/empty'
import { AlertCircle } from 'lucide-react'

interface ArchivedGuidesListErrorProps {
  error: Error
  onRetry?: () => void
}

export function ArchivedGuidesListError({ error, onRetry }: ArchivedGuidesListErrorProps) {
  const t = useTranslations('guides')
  const tCommon = useTranslations('common')

  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <AlertCircle className="text-destructive" />
        </EmptyMedia>
        <EmptyTitle>{t('error.failedToLoad')}</EmptyTitle>
        <EmptyDescription>{error.message || t('error.unexpected')}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button onClick={onRetry} variant="outline">
          {tCommon('tryAgain')}
        </Button>
      </EmptyContent>
    </Empty>
  )
}
