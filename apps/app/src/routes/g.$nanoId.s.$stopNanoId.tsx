import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { clientEnv } from '@valguide/core/env/client'
import { getGuideIdByStopNanoId } from '@valguide/core/features/guides/public/get-guide-by-stop'
import { getPublishedGuideByNanoId } from '@valguide/core/features/guides/public/get-published-guide'
import { getStopByNanoId } from '@valguide/core/features/guides/public/get-published-stop'
import { getLocalizedGuideText } from '@valguide/core/features/guides/public/localization-helpers'
import { FullPlayer } from '@valguide/core/features/player/components/full-player'
import { PlayerProvider } from '@valguide/core/features/player/store/player-provider'
import { GuideThemeProvider } from '@valguide/core/features/player/theming/guide-theme-provider'
import { toPlayerStops } from '@valguide/core/features/player/utils'
import type { SupportedLocale } from '@valguide/core/i18n/i18n.config'
import { ChevronLeft } from 'lucide-react'
import { z } from 'zod'

const getStopDataFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ nanoId: z.string(), stopNanoId: z.string() }))
  .handler(async ({ data }) => {
    const stop = await getStopByNanoId(data.stopNanoId)
    if (!stop) return null

    const guideId = await getGuideIdByStopNanoId(data.stopNanoId)
    if (!guideId) return null

    const guide = await getPublishedGuideByNanoId(data.nanoId)
    if (!guide) return null

    const currentIndex = guide.stops.findIndex((s) => s.nanoId === data.stopNanoId)
    if (currentIndex === -1) return null

    return { stop, guide, currentIndex }
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
  const { guide } = Route.useLoaderData()
  const { locale } = Route.useRouteContext()
  const { nanoId, stopNanoId } = Route.useParams()

  const guideTitle = getLocalizedGuideText(guide, 'title', locale as SupportedLocale)
  const playerStops = toPlayerStops(guide.stops, locale)

  return (
    <GuideThemeProvider
      initialTheme={guide.theme}
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
            {guideTitle}
          </Link>

          <FullPlayer />
        </div>
      </PlayerProvider>
    </GuideThemeProvider>
  )
}
