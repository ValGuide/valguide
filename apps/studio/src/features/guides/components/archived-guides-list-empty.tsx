import { useTranslations } from '@valguide/core/i18n/client'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@valguide/ui/components/empty'
import { Archive } from 'lucide-react'

export function ArchivedGuidesListEmpty() {
  const t = useTranslations('guides')

  return (
    <Empty className="flex min-h-[60vh] items-center justify-center border bg-muted/10">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Archive className="h-10 w-10 text-muted-foreground/60" />
        </EmptyMedia>
        <EmptyTitle className="text-xl">{t('archived.empty.title')}</EmptyTitle>
        <EmptyDescription className="text-balance">{t('archived.empty.description')}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
