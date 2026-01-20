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

interface ListErrorProps {
  error: Error
  onRetry?: () => void
  title?: string
  fallbackMessage?: string
}

export function ListError({ error, onRetry, title, fallbackMessage }: ListErrorProps) {
  const tCommon = useTranslations('common')

  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <AlertCircle className="text-destructive" />
        </EmptyMedia>
        <EmptyTitle>{title ?? tCommon('error')}</EmptyTitle>
        <EmptyDescription>{error.message || fallbackMessage || tCommon('error')}</EmptyDescription>
      </EmptyHeader>
      {onRetry && (
        <EmptyContent>
          <Button onClick={onRetry} variant="outline">
            {tCommon('tryAgain')}
          </Button>
        </EmptyContent>
      )}
    </Empty>
  )
}
