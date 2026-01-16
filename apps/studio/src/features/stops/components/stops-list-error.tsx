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

interface StopsListErrorProps {
  error: Error
  onRetry?: () => void
}

export function StopsListError({ error, onRetry }: StopsListErrorProps) {
  const t = useTranslations('stops')
  const tCommon = useTranslations('common')

  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <AlertCircle className="text-destructive" />
        </EmptyMedia>
        <EmptyTitle>{t('list.error')}</EmptyTitle>
        <EmptyDescription>{error.message ?? tCommon('error')}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button onClick={onRetry} variant="outline">
          {tCommon('tryAgain')}
        </Button>
      </EmptyContent>
    </Empty>
  )
}
