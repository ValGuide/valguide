import { createFileRoute, Link, notFound, useNavigate } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { clientEnv } from '@valguide/core/env/client'
import { getTourIdByStopNanoId } from '@valguide/core/features/tours/public/get-guide-by-stop'
import { getPublishedTourByNanoId } from '@valguide/core/features/tours/public/get-published-guide'
import { getStopByNanoId } from '@valguide/core/features/tours/public/get-published-stop'
import { getLocalizedTourText } from '@valguide/core/features/tours/public/localization-helpers'
import { FullPlayer } from '@valguide/core/features/player/components/full-player'
import { StopsList } from '@valguide/core/features/player/components/stops-list'
import { PlayerProvider } from '@valguide/core/features/player/store/player-provider'
import { GuideThemeProvider } from '@valguide/core/features/player/theming/guide-theme-provider'
import { toPlayerStops } from '@valguide/core/features/player/utils'
import { useTranslations } from '@valguide/core/i18n/client'
import type { SupportedLocale } from '@valguide/core/i18n/i18n.config'
import { Button } from '@valguide/core/ui/components/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@valguide/core/ui/components/sheet'
import { ChevronLeft, ListMusic } from 'lucide-react'
import { useState } from 'react'
import { z } from 'zod'

const getStopDataFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ nanoId: z.string(), stopNanoId: z.string() }))
  .handler(async ({ data }) => {
    const stop = await getStopByNanoId(data.stopNanoId)
    if (!stop) return null

    const tourId = await getTourIdByStopNanoId(data.stopNanoId)
    if (!tourId) return null

    const tour = await getPublishedTourByNanoId(data.nanoId)
    if (!tour) return null

    const currentIndex = tour.stops.findIndex((s) => s.nanoId === data.stopNanoId)
    if (currentIndex === -1) return null

    return { stop, tour, currentIndex }
  })

export const Route = createFileRoute('/g/$nanoId/s/$stopNanoId')({
  loader: async ({ params }) => {
    const result = await getStopDataFn({ data: { nanoId: params.nanoId, stopNanoId: params.stopNanoId } })
    if (!result) {
      throw notFound()
    }
    return result
  },
  component: StopPage,
})

function StopPage() {
  const { tour } = Route.useLoaderData()
  const { locale } = Route.useRouteContext()
  const { nanoId, stopNanoId } = Route.useParams()
  const navigate = useNavigate()

  const tourTitle = getLocalizedTourText(tour, 'title', locale as SupportedLocale)
  const playerStops = toPlayerStops(tour.stops, locale)

  const [stopsSheetOpen, setStopsSheetOpen] = useState(false)

  const handleStopSelect = (selectedNanoId: string) => {
    setStopsSheetOpen(false)
    navigate({
      to: '/g/$nanoId/s/$stopNanoId',
      params: { nanoId, stopNanoId: selectedNanoId },
    })
  }

  return (
    <GuideThemeProvider
      initialTheme={tour.theme}
      enablePreview
      allowedOrigins={[clientEnv.VITE_STUDIO_URL].filter(Boolean) as string[]}
    >
      <PlayerProvider stops={playerStops} initialStopNanoId={stopNanoId}>
        <div className="container max-w-lg py-6 space-y-6">
          <Link
            to="/g/$nanoId"
            params={{ nanoId }}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            {tourTitle}
          </Link>

          <FullPlayer />

          <ViewAllStopsButton onClick={() => setStopsSheetOpen(true)} />

          <Sheet open={stopsSheetOpen} onOpenChange={setStopsSheetOpen}>
            <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>{tourTitle}</SheetTitle>
              </SheetHeader>
              <div className="py-4">
                <StopsList showSearchBar={false} onStopSelect={handleStopSelect} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </PlayerProvider>
    </GuideThemeProvider>
  )
}

function ViewAllStopsButton({ onClick }: { onClick: () => void }) {
  const t = useTranslations('player')

  return (
    <Button variant="outline" className="w-full" onClick={onClick}>
      <ListMusic className="h-4 w-4 mr-2" />
      {t('viewAllStops')}
    </Button>
  )
}
