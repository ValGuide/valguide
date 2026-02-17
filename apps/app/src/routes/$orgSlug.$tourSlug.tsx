import { createFileRoute, notFound, Outlet, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { db } from '@valguide/core/features/db'
import { resolveOrgByIdOrSlug } from '@valguide/core/features/orgs/resolve-org.server'
import { getPublishedTourByNanoId } from '@valguide/core/features/tours/public/get-published-tour'
import { resolveTourByIdOrSlug } from '@valguide/core/features/tours/tour/slug/resolve-tour.server'
import { z } from 'zod'

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
  component: () => <Outlet />,
})
