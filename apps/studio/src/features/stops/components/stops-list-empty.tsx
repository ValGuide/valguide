import { useTranslations } from '@valguide/core/i18n/client'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@valguide/ui/components/empty'
import { PageTitle } from '@valguide/ui/components/page-title'
import { MapPin } from 'lucide-react'

export function StopsListEmpty() {
  const t = useTranslations('stops')

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div className="space-y-1">
        <PageTitle as="h2">{t('title')}</PageTitle>
        <p className="text-sm text-muted-foreground">{t('list.description')}</p>
      </div>
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
    </div>
  )
}
