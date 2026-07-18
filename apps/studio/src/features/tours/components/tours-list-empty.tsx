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
import { AudioLines, Headphones, Image, LoaderCircle, LockKeyhole, MapPinned, Plus, Sparkles } from 'lucide-react'

interface ToursListEmptyProps {
  onCreateTour?: () => void
  isCreatingTour?: boolean
}

const tourPreviewRows = [
  { Icon: Image, lineWidth: 'w-2/3' },
  { Icon: AudioLines, lineWidth: 'w-1/2' },
  { Icon: MapPinned, lineWidth: 'w-2/5' },
] as const

function TourPreviewIllustration() {
  return (
    <div className="relative mx-auto w-full max-w-sm" aria-hidden="true">
      <div className="absolute inset-x-8 -top-3 h-full rotate-3 rounded-2xl border bg-card/60 shadow-sm" />
      <div className="absolute inset-x-8 -bottom-3 h-full -rotate-3 rounded-2xl border bg-card/60 shadow-sm" />
      <div className="relative overflow-hidden rounded-2xl border bg-card shadow-(--shadow-card-hover)">
        <div className="relative flex h-40 items-center justify-center overflow-hidden bg-amber-100 dark:bg-amber-950/50">
          <div className="absolute -left-10 -top-12 size-40 rounded-full bg-amber-300/50 blur-2xl dark:bg-amber-700/20" />
          <div className="absolute -bottom-16 -right-8 size-44 rounded-full bg-orange-300/40 blur-2xl dark:bg-orange-800/20" />
          <div className="relative flex size-20 items-center justify-center rounded-full border border-amber-200 bg-background/80 shadow-lg backdrop-blur dark:border-amber-800">
            <Headphones className="size-9 text-amber-700 dark:text-amber-300" />
          </div>
        </div>

        <div className="space-y-5 p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="h-3 w-2/3 rounded-full bg-foreground/80" />
              <div className="h-2 w-1/2 rounded-full bg-muted-foreground/25" />
            </div>
            <div className="h-5 w-14 rounded-full bg-amber-100 dark:bg-amber-950" />
          </div>

          <div className="space-y-2.5">
            {tourPreviewRows.map(({ Icon, lineWidth }, index) => (
              <div key={lineWidth} className="flex items-center gap-3 rounded-xl border bg-muted/20 p-2.5">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-background shadow-sm">
                  <Icon className="size-4 text-muted-foreground" />
                </div>
                <div className="flex flex-1 items-center gap-1.5">
                  <span className={`h-1.5 rounded-full bg-muted-foreground/25 ${lineWidth}`} />
                  <span className="h-1.5 flex-1 rounded-full bg-muted-foreground/10" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">0{index + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function ToursListEmpty({ onCreateTour, isCreatingTour = false }: ToursListEmptyProps) {
  const t = useTranslations('tours')

  return (
    <Empty className="relative min-h-[60vh] overflow-hidden border bg-muted/10 px-6 py-12 text-left sm:px-10 lg:px-14">
      <div className="absolute -right-24 -top-24 size-72 rounded-full bg-amber-400/10 blur-3xl" />
      <div className="relative grid w-full max-w-4xl items-center gap-12 lg:grid-cols-[minmax(16rem,0.8fr)_minmax(0,1fr)] lg:gap-16">
        <TourPreviewIllustration />

        <div className="flex min-w-0 flex-col items-start gap-6">
          <EmptyHeader className="max-w-xl items-start gap-3 text-left">
            <div className="flex items-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-300">
              <EmptyMedia
                variant="icon"
                className="mb-0 size-9 rounded-full border border-amber-200 bg-amber-50 text-amber-700 shadow-sm dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300"
              >
                <Sparkles className="size-4" />
              </EmptyMedia>
              <span>{t('empty.eyebrow')}</span>
            </div>
            <EmptyTitle className="text-2xl font-semibold tracking-tight sm:text-3xl" role="heading" aria-level={2}>
              {t('empty.title')}
            </EmptyTitle>
            <EmptyDescription className="max-w-lg text-pretty text-base/relaxed">
              {t('empty.heroDescription')}
            </EmptyDescription>
          </EmptyHeader>

          <EmptyContent className="max-w-xl items-start gap-6 text-left">
            <ul className="grid w-full gap-3 text-sm sm:grid-cols-3 lg:grid-cols-1">
              <li className="flex items-center gap-3">
                <AudioLines className="size-4 shrink-0 text-amber-700 dark:text-amber-300" />
                <span>{t('empty.features.media')}</span>
              </li>
              <li className="flex items-center gap-3">
                <MapPinned className="size-4 shrink-0 text-amber-700 dark:text-amber-300" />
                <span>{t('empty.features.stops')}</span>
              </li>
              <li className="flex items-center gap-3">
                <LockKeyhole className="size-4 shrink-0 text-amber-700 dark:text-amber-300" />
                <span>{t('empty.features.draft')}</span>
              </li>
            </ul>

            <div className="flex flex-col items-start gap-2.5">
              <Button
                type="button"
                onClick={onCreateTour}
                size="lg"
                data-testid="tours-create-button"
                disabled={isCreatingTour}
                aria-busy={isCreatingTour}
              >
                {isCreatingTour ? <LoaderCircle className="animate-spin" /> : <Plus />}
                {isCreatingTour ? t('empty.creatingButton') : t('empty.createButton')}
              </Button>
              <p className="text-xs text-muted-foreground">{t('empty.draftHint')}</p>
            </div>
          </EmptyContent>
        </div>
      </div>
    </Empty>
  )
}
