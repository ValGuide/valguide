import { useTranslations } from '@valguide/core/i18n/client'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@valguide/ui/components/empty'
import { MapPin } from 'lucide-react'

export function StopsListEmpty() {
  const t = useTranslations('stops')

  return (
    <Empty className="flex min-h-[60vh] items-center justify-center border bg-muted/10">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <MapPin className="h-10 w-10 text-amber-600" />
        </EmptyMedia>
        <EmptyTitle className="text-xl">{t('empty.title')}</EmptyTitle>
        <EmptyDescription className="text-balance">{t('empty.heroDescription')}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <p className="text-sm text-muted-foreground">{t('empty.hint')}</p>
      </EmptyContent>
    </Empty>
  )
}
