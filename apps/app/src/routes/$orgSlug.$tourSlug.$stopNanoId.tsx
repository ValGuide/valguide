import { createFileRoute, Link, notFound, useNavigate } from '@tanstack/react-router'
import { clientEnv } from '@valguide/core/env/client'
import { FullPlayer } from '@valguide/core/features/player/components/full-player'
import { StopsList } from '@valguide/core/features/player/components/stops-list'
import { PlayerProvider } from '@valguide/core/features/player/store/player-provider'
import { useCurrentStopNanoId } from '@valguide/core/features/player/store/use-player-store'
import {
  TourThemeProvider,
  useTourThemePortalContainer,
} from '@valguide/core/features/player/theming/tour-theme-provider'
import { toPlayerStops } from '@valguide/core/features/player/utils'
import { getLocalizedTourText } from '@valguide/core/features/tours/public/localization-helpers'
import { useTranslations } from '@valguide/core/i18n/client'
import type { SupportedLocale } from '@valguide/core/i18n/i18n.config'
import { Button } from '@valguide/core/ui/components/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@valguide/core/ui/components/sheet'
import { ChevronLeft, ListMusic } from 'lucide-react'
import { useEffect, useState } from 'react'
import { TourLanguageControl } from '@/components/tours/tour-language-control'

export const Route = createFileRoute('/$orgSlug/$tourSlug/$stopNanoId')({
  beforeLoad: ({ params, context }) => {
    const currentIndex = context.tour.stops.findIndex((s) => s.nanoId === params.stopNanoId)
    if (currentIndex === -1) {
      throw notFound()
    }

    const stop = context.tour.stops[currentIndex]
    return { stop, currentIndex }
  },
  component: StopPage,
})

function StopPage() {
  const { tour } = Route.useRouteContext()

  return (
    <TourThemeProvider
      initialTheme={tour.theme}
      enablePreview
      allowedOrigins={[clientEnv.VITE_STUDIO_URL].filter(Boolean) as string[]}
    >
      <StopPageContent />
    </TourThemeProvider>
  )
}

function StopPageContent() {
  const { tour, orgSlug, tourSlug, locale, tourLocaleState } = Route.useRouteContext()
  const { stopNanoId } = Route.useParams()
  const navigate = useNavigate()
  const themedPortalContainer = useTourThemePortalContainer()

  const tourTitle = getLocalizedTourText(tour, 'title', locale as SupportedLocale)
  const playerStops = toPlayerStops(tour.stops, locale)

  const [stopsSheetOpen, setStopsSheetOpen] = useState(false)

  const handleStopSelect = (selectedNanoId: string) => {
    setStopsSheetOpen(false)
    navigate({
      to: '/$orgSlug/$tourSlug/$stopNanoId',
      params: { orgSlug, tourSlug, stopNanoId: selectedNanoId },
    })
  }

  return (
    <PlayerProvider stops={playerStops} initialStopNanoId={stopNanoId}>
      <SyncStopToUrl stopNanoId={stopNanoId} orgSlug={orgSlug} tourSlug={tourSlug} />
      <div className="mx-auto max-w-lg space-y-6 px-4 py-6 sm:max-w-xl sm:px-6 sm:py-10 md:max-w-2xl lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <Link
            to="/$orgSlug/$tourSlug"
            params={{ orgSlug, tourSlug }}
            className="inline-flex min-w-0 items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4 shrink-0" />
            <span className="truncate">{tourTitle}</span>
          </Link>
          <TourLanguageControl {...tourLocaleState} />
        </div>

        <FullPlayer />

        <ViewAllStopsButton onClick={() => setStopsSheetOpen(true)} />

        <Sheet open={stopsSheetOpen} onOpenChange={setStopsSheetOpen}>
          <SheetContent side="bottom" container={themedPortalContainer} className="max-h-[80vh] overflow-y-auto">
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
  )
}

function SyncStopToUrl({ stopNanoId, orgSlug, tourSlug }: { stopNanoId: string; orgSlug: string; tourSlug: string }) {
  const navigate = useNavigate()
  const currentStopNanoId = useCurrentStopNanoId()

  useEffect(() => {
    if (currentStopNanoId && currentStopNanoId !== stopNanoId) {
      navigate({
        to: '/$orgSlug/$tourSlug/$stopNanoId',
        params: { orgSlug, tourSlug, stopNanoId: currentStopNanoId },
        replace: true,
      })
    }
  }, [currentStopNanoId, stopNanoId, navigate, orgSlug, tourSlug])

  return null
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
