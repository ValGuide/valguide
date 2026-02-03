import { createFileRoute, notFound, useNavigate } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getAssetImageUrl } from '@valguide/core/features/assets/image-url'
import { getPublishedGuideByNanoId } from '@valguide/core/features/guides/public/get-published-guide'
import { getLocalizedGuideText } from '@valguide/core/features/guides/public/localization-helpers'
import { QrScannerModal } from '@valguide/core/features/player/components/qr-scanner-modal'
import { StopsList } from '@valguide/core/features/player/components/stops-list'
import { PlayerProvider } from '@valguide/core/features/player/store/player-provider'
import { usePlayerActions, usePlayerStore, useStops } from '@valguide/core/features/player/store/use-player-store'
import { toPlayerStops } from '@valguide/core/features/player/utils'
import type { SupportedLocale } from '@valguide/core/i18n/i18n.config'
import { useCallback, useEffect, useState } from 'react'
import { z } from 'zod'
import { GuideHero } from '@/components/guides/guide-hero'
import { GuideMetadata } from '@/components/guides/guide-metadata'

const getGuideByNanoIdFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ nanoId: z.string() }))
  .handler(async ({ data }) => {
    const guide = await getPublishedGuideByNanoId(data.nanoId)
    return guide
  })

export const Route = createFileRoute('/g/$nanoId')({
  loader: async ({ params }) => {
    const guide = await getGuideByNanoIdFn({ data: { nanoId: params.nanoId } })
    if (!guide) {
      throw notFound()
    }
    return { guide }
  },
  component: GuidePage,
})

function GuidePage() {
  const { guide } = Route.useLoaderData()
  const { locale } = Route.useRouteContext()
  const { nanoId } = Route.useParams()

  const title = getLocalizedGuideText(guide, 'title', locale as SupportedLocale)
  const description = getLocalizedGuideText(guide, 'description', locale as SupportedLocale)
  const coverAsset = guide.assets?.find((a) => a.channel === 'images.hero')
  const coverImageUrl = coverAsset ? getAssetImageUrl(coverAsset) : null
  const playerStops = toPlayerStops(guide.stops, locale)

  return (
    <PlayerProvider stops={playerStops}>
      <div className="container max-w-lg py-6 space-y-6">
        <GuideHero title={title} description={description} coverImage={coverImageUrl} assets={guide.assets} />
        <GuideMetadata stopCount={guide.stops.length} createdAt={guide.createdAt} locale={locale} />
        <StopsListWithNavigation guideNanoId={nanoId} />
      </div>
    </PlayerProvider>
  )
}

function StopsListWithNavigation({ guideNanoId }: { guideNanoId: string }) {
  const navigate = useNavigate()
  const currentStopNanoId = usePlayerStore((s) => s.currentStopNanoId)
  const stops = useStops()
  const { setCurrentStop } = usePlayerActions()
  const [qrScannerOpen, setQrScannerOpen] = useState(false)

  useEffect(() => {
    if (currentStopNanoId) {
      navigate({
        to: '/g/$nanoId/s/$stopNanoId',
        params: { nanoId: guideNanoId, stopNanoId: currentStopNanoId },
      })
    }
  }, [currentStopNanoId, guideNanoId, navigate])

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

  return (
    <>
      <StopsList onQrScanRequest={() => setQrScannerOpen(true)} />
      <QrScannerModal open={qrScannerOpen} onOpenChange={setQrScannerOpen} onScan={handleQrScan} />
    </>
  )
}
