import type { ArchivedTourListItem } from '@valguide/core/features/tours/tour/list-archived-tours.fn'
import { useTranslations } from '@valguide/core/i18n/client'
import { Button } from '@valguide/ui/components/button'
import { Card, CardFooter, CardHeader, CardTitle } from '@valguide/ui/components/card'
import { StatusBadge } from '@valguide/ui/components/status-badge'
import { ImageIcon, RotateCcw, Trash2 } from 'lucide-react'

interface ArchivedToursListContentProps {
  tours: ArchivedTourListItem[]
  onRecover: (nanoId: string, tourName: string) => void
  onDelete: (nanoId: string, tourName: string) => void
}

export function ArchivedToursListContent({ tours, onRecover, onDelete }: ArchivedToursListContentProps) {
  const t = useTranslations('tours')

  const formatDate = (date?: Date | string) => {
    if (!date) return ''
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(date))
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {tours.map((tour) => {
        const displayTitle = tour.title ?? t('untitledTour')

        return (
          <Card key={tour.nanoId} className="flex h-full flex-col overflow-hidden">
            <div className="relative h-44 w-full shrink-0 overflow-hidden">
              <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-muted/30 px-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800/50">
                  <ImageIcon className="h-7 w-7 text-slate-400 dark:text-slate-500" />
                </div>
                <p className="text-xs text-muted-foreground/70">{t('noCoverImage')}</p>
              </div>
            </div>
            <CardHeader className="pb-0">
              <CardTitle className="flex items-start justify-between gap-3">
                <span className="line-clamp-2 flex-1 break-all text-base font-semibold leading-snug">
                  {displayTitle}
                </span>
                <StatusBadge status="archived" size="sm" className="mt-0.5 shrink-0">
                  {t('archivedStatus')}
                </StatusBadge>
              </CardTitle>
            </CardHeader>
            <CardFooter className="flex-col items-stretch gap-3 pt-4">
              <div className="flex flex-col gap-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onRecover(tour.nanoId, displayTitle)}
                  className="w-full"
                >
                  <RotateCcw className="h-4 w-4 shrink-0" />
                  {t('recoverTour')}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(tour.nanoId, displayTitle)}
                  className="w-full text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 shrink-0" />
                  {t('permanentlyDelete')}
                </Button>
              </div>
              <span className="text-xs text-muted-foreground/70">
                {t('archivedOnDate', { date: formatDate(tour.archivedAt) })}
              </span>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}
