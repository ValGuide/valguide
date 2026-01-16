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

interface GuidesListErrorProps {
  error: Error
  onRetry?: () => void
}

export function GuidesListError({ error, onRetry }: GuidesListErrorProps) {
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
