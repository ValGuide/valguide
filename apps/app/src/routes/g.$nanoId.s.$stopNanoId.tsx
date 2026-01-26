import { createFileRoute, notFound } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getGuideIdByStopNanoId } from '@valguide/core/features/guides/public/get-guide-by-stop'
import { getPublishedGuideByNanoId } from '@valguide/core/features/guides/public/get-published-guide'
import { getStopByNanoId } from '@valguide/core/features/guides/public/get-published-stop'
import { z } from 'zod'
import { StopContent } from '@/components/stops/stop-content'
import { StopNavigation } from '@/components/stops/stop-navigation'

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
  const { stop, guide, currentIndex } = Route.useLoaderData()
  const { locale } = Route.useRouteContext()
  const { nanoId } = Route.useParams()

  return (
    <div className="container max-w-3xl py-8 space-y-8">
      <StopContent stop={stop} locale={locale} stopNumber={currentIndex + 1} />
      <StopNavigation guideNanoId={nanoId} currentIndex={currentIndex} stops={guide.stops} locale={locale} />
    </div>
  )
}
