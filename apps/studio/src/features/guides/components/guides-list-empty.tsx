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
import { BookOpen, Plus } from 'lucide-react'

interface GuidesListEmptyProps {
  isCreating?: boolean
  onCreateGuide?: () => void
}

export function GuidesListEmpty({ isCreating = false, onCreateGuide }: GuidesListEmptyProps) {
  const t = useTranslations('guides')

  return (
    <div className="mx-auto max-w-3xl">
      <Empty className="border bg-muted/10">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <BookOpen className="h-10 w-10 text-amber-600" />
          </EmptyMedia>
          <EmptyTitle className="text-xl">{t('empty.title')}</EmptyTitle>
          <EmptyDescription className="text-base">{t('empty.heroDescription')}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="space-y-6">
          <div className="grid gap-4 text-left text-sm text-muted-foreground md:grid-cols-2">
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                <span>{t('empty.feature1')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                <span>{t('empty.feature2')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                <span>{t('empty.feature3')}</span>
              </li>
            </ul>
            <div className="rounded-lg border bg-background p-4 text-xs italic leading-relaxed text-muted-foreground/80">
              "{t('empty.quote')}"
            </div>
          </div>
          <Button onClick={onCreateGuide} size="lg" disabled={isCreating} className="group">
            <Plus className="transition-transform group-hover:rotate-90" />
            {isCreating ? t('empty.creating') : t('empty.createButton')}
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  )
}
