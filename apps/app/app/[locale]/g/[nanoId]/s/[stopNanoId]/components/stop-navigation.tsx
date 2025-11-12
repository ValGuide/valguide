import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Button } from '@valguide/core/ui/components/button'
import { ChevronLeft, ChevronRight, List } from 'lucide-react'
import type { StopWithAssets } from '@valguide/core/features/guides/queries'

type StopNavigationProps = {
  guideNanoId: string
  currentIndex: number
  stops: StopWithAssets[]
  locale: string
}

export function StopNavigation({ guideNanoId, currentIndex, stops, locale }: StopNavigationProps) {
  const t = useTranslations('guide')
  const prevStop = currentIndex > 0 ? stops[currentIndex - 1] : null
  const nextStop = currentIndex < stops.length - 1 ? stops[currentIndex + 1] : null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        {prevStop ? (
          <Button asChild variant="outline">
            <Link href={`/${locale}/g/${guideNanoId}/s/${prevStop.nanoId}`}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              {t('previous')}
            </Link>
          </Button>
        ) : (
          <div />
        )}

        <Button asChild variant="outline">
          <Link href={`/${locale}/g/${guideNanoId}`}>
            <List className="h-4 w-4 mr-2" />
            {t('backToOverview')}
          </Link>
        </Button>

        {nextStop ? (
          <Button asChild variant="outline">
            <Link href={`/${locale}/g/${guideNanoId}/s/${nextStop.nanoId}`}>
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
