import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { clientEnv } from '@valguide/core/env/client'
import { getAssetImageUrl } from '@valguide/core/features/assets/image-url'
import { getPublishedTourByNanoId } from '@valguide/core/features/tours/public/get-published-guide'
import { getLocalizedTourText } from '@valguide/core/features/tours/public/localization-helpers'
import { QrScannerModal } from '@valguide/core/features/player/components/qr-scanner-modal'
import { PlayerProvider } from '@valguide/core/features/player/store/player-provider'
import { usePlayerActions, useStops } from '@valguide/core/features/player/store/use-player-store'
import { GuideThemeProvider } from '@valguide/core/features/player/theming/guide-theme-provider'
import { toPlayerStops } from '@valguide/core/features/player/utils'
import { useTranslations } from '@valguide/core/i18n/client'
import type { SupportedLocale } from '@valguide/core/i18n/i18n.config'
import { Button } from '@valguide/core/ui/components/button'
import { Play, QrCode } from 'lucide-react'
import { useCallback, useState } from 'react'
import { z } from 'zod'
import { TourHero } from '@/components/tours/tour-hero'
import { TourMetadata } from '@/components/tours/tour-metadata'

const getTourByNanoIdFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ nanoId: z.string() }))
  .handler(async ({ data }) => {
    const tour = await getPublishedTourByNanoId(data.nanoId)
    return tour
  })

export const Route = createFileRoute('/g/$nanoId')({
  loader: async ({ params }) => {
    const tour = await getTourByNanoIdFn({ data: { nanoId: params.nanoId } })
    if (!tour) {
      throw notFound()
    }
    return { tour }
  },
  component: TourPage,
})

function TourPage() {
  const { tour } = Route.useLoaderData()
  const { locale } = Route.useRouteContext()
  const { nanoId } = Route.useParams()

  const title = getLocalizedTourText(tour, 'title', locale as SupportedLocale)
  const description = getLocalizedTourText(tour, 'description', locale as SupportedLocale)
  const coverAsset = tour.assets?.find((a) => a.channel === 'images.hero')
  const coverImageUrl = coverAsset ? getAssetImageUrl(coverAsset) : null
  const playerStops = toPlayerStops(tour.stops, locale)

  return (
    <GuideThemeProvider
      initialTheme={tour.theme}
      enablePreview
      allowedOrigins={[clientEnv.VITE_STUDIO_URL].filter(Boolean) as string[]}
    >
      <PlayerProvider stops={playerStops}>
        <div className="container max-w-lg py-6 space-y-6">
          <TourHero title={title} description={description} coverImage={coverImageUrl} assets={tour.assets} />
          <TourMetadata stopCount={tour.stops.length} createdAt={tour.createdAt} locale={locale} />
          <TourActions tourNanoId={nanoId} />
        </div>
      </PlayerProvider>
    </GuideThemeProvider>
  )
}

function TourActions({ tourNanoId }: { tourNanoId: string }) {
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
          <Link to="/g/$nanoId/s/$stopNanoId" params={{ nanoId: tourNanoId, stopNanoId: firstStopNanoId }}>
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
