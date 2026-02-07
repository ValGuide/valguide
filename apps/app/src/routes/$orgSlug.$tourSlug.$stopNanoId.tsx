import { createFileRoute, Link, notFound, redirect, useNavigate } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { clientEnv } from '@valguide/core/env/client'
import { db } from '@valguide/core/features/db'
import { resolveOrgByIdOrSlug } from '@valguide/core/features/orgs/resolve-org.server'
import { FullPlayer } from '@valguide/core/features/player/components/full-player'
import { StopsList } from '@valguide/core/features/player/components/stops-list'
import { PlayerProvider } from '@valguide/core/features/player/store/player-provider'
import { TourThemeProvider } from '@valguide/core/features/player/theming/tour-theme-provider'
import { toPlayerStops } from '@valguide/core/features/player/utils'
import { getStopByNanoId } from '@valguide/core/features/tours/public/get-published-stop'
import { getPublishedTourByNanoId } from '@valguide/core/features/tours/public/get-published-tour'
import { getLocalizedTourText } from '@valguide/core/features/tours/public/localization-helpers'
import { resolveTourByIdOrSlug } from '@valguide/core/features/tours/tour/slug/resolve-tour.server'
import { useTranslations } from '@valguide/core/i18n/client'
import type { SupportedLocale } from '@valguide/core/i18n/i18n.config'
import { Button } from '@valguide/core/ui/components/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@valguide/core/ui/components/sheet'
import { ChevronLeft, ListMusic } from 'lucide-react'
import { useState } from 'react'
import { z } from 'zod'

const getStopDataFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ orgSlug: z.string(), tourSlug: z.string(), stopNanoId: z.string() }))
  .handler(async ({ data }) => {
    const orgResolved = await resolveOrgByIdOrSlug(db, data.orgSlug)
    if (!orgResolved.found) {
      return null
    }

    const tourResolved = await resolveTourByIdOrSlug(db, orgResolved.organizationId, data.tourSlug)
    if (!tourResolved.found) {
      return null
    }

    // Check if redirect needed
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
        stopNanoId: data.stopNanoId,
      }
    }

    const stop = await getStopByNanoId(data.stopNanoId)
    if (!stop) {
      return null
    }

    const tour = await getPublishedTourByNanoId(tourResolved.tourNanoId)
    if (!tour) {
      return null
    }

    const currentIndex = tour.stops.findIndex((s) => s.nanoId === data.stopNanoId)
    if (currentIndex === -1) {
      return null
    }

    return {
      redirect: false as const,
      stop,
      tour,
      currentIndex,
      orgSlug: orgResolved.primarySlug ?? data.orgSlug,
      tourSlug: tourResolved.primarySlug ?? data.tourSlug,
    }
  })

export const Route = createFileRoute('/$orgSlug/$tourSlug/$stopNanoId')({
  loader: async ({ params }) => {
    const result = await getStopDataFn({ data: params })

    if (!result) {
      throw notFound()
    }

    if (result.redirect) {
      throw redirect({
        to: '/$orgSlug/$tourSlug/$stopNanoId',
        params: { orgSlug: result.orgSlug, tourSlug: result.tourSlug, stopNanoId: result.stopNanoId },
        statusCode: 301,
      })
    }

    return {
      stop: result.stop,
      tour: result.tour,
      currentIndex: result.currentIndex,
      orgSlug: result.orgSlug,
      tourSlug: result.tourSlug,
    }
  },
  component: StopPage,
})

function StopPage() {
  const { tour, orgSlug, tourSlug } = Route.useLoaderData()
  const { locale } = Route.useRouteContext()
  const { stopNanoId } = Route.useParams()
  const navigate = useNavigate()

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
    <TourThemeProvider
      initialTheme={tour.theme}
      enablePreview
      allowedOrigins={[clientEnv.VITE_STUDIO_URL].filter(Boolean) as string[]}
    >
      <PlayerProvider stops={playerStops} initialStopNanoId={stopNanoId}>
        <div className="container max-w-lg py-6 space-y-6">
          <Link
            to="/$orgSlug/$tourSlug"
            params={{ orgSlug, tourSlug }}
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
    </TourThemeProvider>
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
