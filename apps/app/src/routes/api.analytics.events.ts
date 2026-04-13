import { createFileRoute } from '@tanstack/react-router'
import {
  guideAnalyticsEventInputSchema,
  trackGuideAnalyticsEvent,
} from '@valguide/core/features/analytics/track-guide-analytics-event.server'

export const Route = createFileRoute('/api/analytics/events')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.json().catch(() => null)
        const parsedBody = guideAnalyticsEventInputSchema.safeParse(body)

        if (!parsedBody.success) {
          return Response.json(
            {
              error: 'Invalid analytics event payload',
            },
            { status: 400 },
          )
        }

        await trackGuideAnalyticsEvent(parsedBody.data)

        return new Response(null, { status: 204 })
      },
    },
  },
})
