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
import { Headphones, Plus } from 'lucide-react'

interface ToursListEmptyProps {
  onCreateTour?: () => void
}

export function ToursListEmpty({ onCreateTour }: ToursListEmptyProps) {
  const t = useTranslations('tours')

  return (
    <Empty className="flex min-h-[60vh] items-center justify-center border bg-muted/10">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Headphones className="h-10 w-10 text-amber-600" />
        </EmptyMedia>
        <EmptyTitle className="text-xl">{t('empty.title')}</EmptyTitle>
        <EmptyDescription className="text-balance">{t('empty.heroDescription')}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button onClick={onCreateTour} size="lg">
          <Plus />
          {t('empty.createButton')}
        </Button>
      </EmptyContent>
    </Empty>
  )
}
