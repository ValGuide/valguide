import { useTranslations } from '@valguide/core/i18n/client'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@valguide/ui/components/empty'
import { PageTitle } from '@valguide/ui/components/page-title'
import { Archive } from 'lucide-react'

export function ArchivedGuidesListEmpty() {
  const t = useTranslations('guides')

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div className="space-y-1">
        <PageTitle as="h2">{t('archived.title')}</PageTitle>
        <p className="text-sm text-muted-foreground">{t('archived.description')}</p>
      </div>
      <Empty className="flex min-h-[60vh] items-center justify-center border bg-muted/10">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Archive className="h-10 w-10 text-muted-foreground/60" />
          </EmptyMedia>
          <EmptyTitle className="text-xl">{t('archived.empty.title')}</EmptyTitle>
          <EmptyDescription className="text-balance">{t('archived.empty.description')}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  )
}
