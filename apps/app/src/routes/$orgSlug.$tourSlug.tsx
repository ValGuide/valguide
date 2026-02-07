import { createFileRoute, Link, notFound, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { clientEnv } from '@valguide/core/env/client'
import { getAssetImageUrl } from '@valguide/core/features/assets/image-url'
import { db } from '@valguide/core/features/db'
import { resolveOrgByIdOrSlug } from '@valguide/core/features/orgs/resolve-org.server'
import { QrScannerModal } from '@valguide/core/features/player/components/qr-scanner-modal'
import { PlayerProvider } from '@valguide/core/features/player/store/player-provider'
import { usePlayerActions, useStops } from '@valguide/core/features/player/store/use-player-store'
import { TourThemeProvider } from '@valguide/core/features/player/theming/tour-theme-provider'
import { toPlayerStops } from '@valguide/core/features/player/utils'
import { getPublishedTourByNanoId } from '@valguide/core/features/tours/public/get-published-tour'
import { getLocalizedTourText } from '@valguide/core/features/tours/public/localization-helpers'
import { resolveTourByIdOrSlug } from '@valguide/core/features/tours/tour/slug/resolve-tour.server'
import { useTranslations } from '@valguide/core/i18n/client'
import type { SupportedLocale } from '@valguide/core/i18n/i18n.config'
import { Button } from '@valguide/core/ui/components/button'
import { Play, QrCode } from 'lucide-react'
import { useCallback, useState } from 'react'
import { z } from 'zod'
import { TourHero } from '@/components/tours/tour-hero'
import { TourMetadata } from '@/components/tours/tour-metadata'

const resolveTourFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ orgSlug: z.string(), tourSlug: z.string() }))
  .handler(async ({ data }) => {
    const orgResolved = await resolveOrgByIdOrSlug(db, data.orgSlug)
    if (!orgResolved.found) {
      return null
    }

    const tourResolved = await resolveTourByIdOrSlug(db, orgResolved.organizationId, data.tourSlug)
    if (!tourResolved.found) {
      return null
    }

    // Check if redirect needed (old slug → primary slug)
    const needsRedirect =
      orgResolved.needsRedirect ||
      tourResolved.needsRedirect ||
      data.orgSlug !== orgResolved.primarySlug ||
      data.tourSlug !== tourResolved.primarySlug

    if (needsRedirect && orgResolved.primarySlug && tourResolved.primarySlug) {
      return {
        redirect: true as const,
        orgSlug: orgResolved.primarySlug,
        tourSlug: tourResolved.primarySlug,
      }
    }

    const tour = await getPublishedTourByNanoId(tourResolved.tourNanoId)
    if (!tour) {
      return null
    }

    return {
      redirect: false as const,
      tour,
      orgSlug: orgResolved.primarySlug ?? data.orgSlug,
      tourSlug: tourResolved.primarySlug ?? data.tourSlug,
    }
  })

export const Route = createFileRoute('/$orgSlug/$tourSlug')({
  loader: async ({ params }) => {
    const result = await resolveTourFn({ data: params })

    if (!result) {
      throw notFound()
    }

    if (result.redirect) {
      throw redirect({
        to: '/$orgSlug/$tourSlug',
        params: { orgSlug: result.orgSlug, tourSlug: result.tourSlug },
        statusCode: 301,
      })
    }

    return { tour: result.tour, orgSlug: result.orgSlug, tourSlug: result.tourSlug }
  },
  component: TourPage,
})

function TourPage() {
  const { tour, orgSlug, tourSlug } = Route.useLoaderData()
  const { locale } = Route.useRouteContext()

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
        <div className="container max-w-lg py-6 space-y-6">
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
