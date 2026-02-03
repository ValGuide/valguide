import { Link } from '@tanstack/react-router'
import type { StopWithAssets } from '@valguide/core/features/tours/public/types'
import { useTranslations } from '@valguide/core/i18n/client'
import { Button } from '@valguide/core/ui/components/button'
import { ChevronLeft, ChevronRight, List } from 'lucide-react'

type StopNavigationProps = {
  tourNanoId: string
  currentIndex: number
  stops: StopWithAssets[]
  locale: string
}

export function StopNavigation({ tourNanoId, currentIndex, stops }: StopNavigationProps) {
  const t = useTranslations('tour')
  const prevStop = currentIndex > 0 ? stops[currentIndex - 1] : null
  const nextStop = currentIndex < stops.length - 1 ? stops[currentIndex + 1] : null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        {prevStop ? (
          <Button asChild variant="outline">
            <Link to="/g/$nanoId/s/$stopNanoId" params={{ nanoId: tourNanoId, stopNanoId: prevStop.nanoId }}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              {t('previous')}
            </Link>
          </Button>
        ) : (
          <div />
        )}

        <Button asChild variant="outline">
          <Link to="/g/$nanoId" params={{ nanoId: tourNanoId }}>
            <List className="h-4 w-4 mr-2" />
            {t('backToOverview')}
          </Link>
        </Button>

        {nextStop ? (
          <Button asChild variant="outline">
            <Link to="/g/$nanoId/s/$stopNanoId" params={{ nanoId: tourNanoId, stopNanoId: nextStop.nanoId }}>
              {t('next')}
              <ChevronRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        ) : (
          <div />
        )}
      </div>

      <div className="text-center text-sm text-muted-foreground">
        {t('stopProgress', { current: currentIndex + 1, total: stops.length })}
      </div>
    </div>
  )
}
