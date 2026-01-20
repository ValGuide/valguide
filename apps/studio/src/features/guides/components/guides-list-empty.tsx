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

interface GuidesListEmptyProps {
  isCreating?: boolean
  onCreateGuide?: () => void
}

export function GuidesListEmpty({ isCreating = false, onCreateGuide }: GuidesListEmptyProps) {
  const t = useTranslations('guides')

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
        <Button onClick={onCreateGuide} size="lg" disabled={isCreating}>
          <Plus />
          {isCreating ? t('empty.creating') : t('empty.createButton')}
        </Button>
      </EmptyContent>
    </Empty>
  )
}
