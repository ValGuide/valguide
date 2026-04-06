import { createFileRoute, Link } from '@tanstack/react-router'
import { clientEnv } from '@valguide/core/env/client'
import { getAssetImageUrl } from '@valguide/core/features/assets/image-url'
import { QrScannerModal } from '@valguide/core/features/player/components/qr-scanner-modal'
import { PlayerProvider } from '@valguide/core/features/player/store/player-provider'
import { usePlayerActions, useStops } from '@valguide/core/features/player/store/use-player-store'
import { TourThemeProvider } from '@valguide/core/features/player/theming/tour-theme-provider'
import { toPlayerStops } from '@valguide/core/features/player/utils'
import { getLocalizedTourText } from '@valguide/core/features/tours/public/localization-helpers'
import { useTranslations } from '@valguide/core/i18n/client'
import type { SupportedLocale } from '@valguide/core/i18n/i18n.config'
import { Button } from '@valguide/core/ui/components/button'
import { Play, QrCode } from 'lucide-react'
import { useCallback, useState } from 'react'
import { TourHero } from '@/components/tours/tour-hero'
import { TourLanguageControl } from '@/components/tours/tour-language-control'
import { TourMetadata } from '@/components/tours/tour-metadata'

export const Route = createFileRoute('/$orgSlug/$tourSlug/')({
  component: TourPage,
})

function TourPage() {
  const { tour, orgSlug, tourSlug, locale, tourLocaleState } = Route.useRouteContext()

  const title = getLocalizedTourText(tour, 'title', locale as SupportedLocale)
  const description = getLocalizedTourText(tour, 'description', locale as SupportedLocale)
  const coverAsset = tour.assets?.find((a) => a.channel === 'images.hero')
  const coverImageUrl = coverAsset ? getAssetImageUrl(coverAsset) : null
  const playerStops = toPlayerStops(tour.stops, locale)

  return (
    <TourThemeProvider
      initialTheme={tour.theme}
      enablePreview
      allowedOrigins={[clientEnv.VITE_STUDIO_URL].filter(Boolean) as string[]}
    >
      <PlayerProvider stops={playerStops}>
        <div className="mx-auto max-w-lg space-y-6 px-4 py-6 sm:max-w-xl sm:px-6 sm:py-10 md:max-w-2xl lg:px-8">
          <div className="flex items-center justify-end">
            <TourLanguageControl {...tourLocaleState} />
          </div>
          <TourHero title={title} description={description} coverImage={coverImageUrl} assets={tour.assets} />
          <TourMetadata stopCount={tour.stops.length} createdAt={tour.createdAt} locale={locale} />
          <TourActions orgSlug={orgSlug} tourSlug={tourSlug} />
        </div>
      </PlayerProvider>
    </TourThemeProvider>
  )
}

function TourActions({ orgSlug, tourSlug }: { orgSlug: string; tourSlug: string }) {
  const t = useTranslations('player')
  const stops = useStops()
  const { setCurrentStop } = usePlayerActions()
  const [qrScannerOpen, setQrScannerOpen] = useState(false)

  const firstStopNanoId = stops[0]?.nanoId

  const handleQrScan = useCallback(
    (scannedValue: string) => {
      const stopNanoIdMatch = scannedValue.match(/\/s\/([a-zA-Z0-9]+)/)
      if (stopNanoIdMatch) {
        const stopNanoId = stopNanoIdMatch[1]
        const matchingStop = stops.find((s) => s.nanoId === stopNanoId)
        if (matchingStop) {
          setCurrentStop(stopNanoId)
          return
        }
      }

      const stopNumber = Number.parseInt(scannedValue, 10)
      if (!Number.isNaN(stopNumber) && stopNumber >= 1 && stopNumber <= stops.length) {
        const stop = stops[stopNumber - 1]
        setCurrentStop(stop.nanoId)
      }
    },
    [stops, setCurrentStop],
  )

  if (!firstStopNanoId) {
    return null
  }

  return (
    <>
      <div className="flex gap-3">
        <Button asChild size="lg" className="flex-1">
          <Link to="/$orgSlug/$tourSlug/$stopNanoId" params={{ orgSlug, tourSlug, stopNanoId: firstStopNanoId }}>
            <Play className="h-5 w-5 mr-2" />
            {t('startTour')}
          </Link>
        </Button>
        <Button variant="outline" size="lg" onClick={() => setQrScannerOpen(true)}>
          <QrCode className="h-5 w-5" />
          <span className="sr-only">{t('scanQrCode')}</span>
        </Button>
      </div>
      <QrScannerModal open={qrScannerOpen} onOpenChange={setQrScannerOpen} onScan={handleQrScan} />
    </>
  )
}
