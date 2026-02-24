import { createFileRoute, notFound, Outlet, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { db } from '@valguide/core/features/db'
import { resolveOrgByIdOrSlug } from '@valguide/core/features/orgs/resolve-org.server'
import { getDraftTourByNanoId } from '@valguide/core/features/tours/public/get-draft-tour'
import { getPublishedTourByNanoId } from '@valguide/core/features/tours/public/get-published-tour'
import {
  readTourFromKv,
  resolveOrgSlugFromKv,
  resolveTourSlugFromKv,
  writeOrgSlugToKv,
  writeTourSlugToKv,
  writeTourToKv,
} from '@valguide/core/features/tours/public/kv-helpers'
import { serializeTourForKv, tourKvDataToTourWithStops } from '@valguide/core/features/tours/public/kv-serializers'
import { resolveTourByIdOrSlug } from '@valguide/core/features/tours/tour/slug/resolve-tour.server'
import { waitUntil } from '@valguide/core/utils/wait-until'
import { z } from 'zod'
import { PreviewBanner } from '@/components/preview-banner'

const tourSearchSchema = z.object({
  preview: z.boolean().optional(),
})

const resolveTourFn = createServerFn({ method: 'GET' })
  .inputValidator(
    z.object({
      orgSlug: z.string(),
      tourSlug: z.string(),
      preview: z.boolean().optional(),
      locale: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const { orgSlug, tourSlug, preview, locale } = data

    // ── KV fast path (published content only) ──────────────────────
    if (!preview) {
      const [orgKv, tourKv] = await Promise.all([
        resolveOrgSlugFromKv(orgSlug),
        resolveTourSlugFromKv(orgSlug, tourSlug),
      ])

      if (orgKv && tourKv) {
        const needsRedirect = orgSlug !== orgKv.primarySlug || tourSlug !== tourKv.primarySlug

        if (needsRedirect) {
          return {
            redirect: true as const,
            orgSlug: orgKv.primarySlug,
            tourSlug: tourKv.primarySlug,
          }
        }

        const tourKvData = await readTourFromKv(tourKv.tourNanoId, locale)
        if (tourKvData) {
          return {
            redirect: false as const,
            tour: tourKvDataToTourWithStops(tourKvData),
            orgSlug: orgKv.primarySlug,
            tourSlug: tourKv.primarySlug,
            isPreviewMode: false,
          }
        }

        // Tour data KV miss — Postgres fallback for data only
        const tour = await getPublishedTourByNanoId(tourKv.tourNanoId)
        if (!tour) return null

        waitUntil(writeTourToKv(tourKv.tourNanoId, locale, serializeTourForKv(tour, locale)))

        return {
          redirect: false as const,
          tour,
          orgSlug: orgKv.primarySlug,
          tourSlug: tourKv.primarySlug,
          isPreviewMode: false,
        }
      }
    }

    // ── Postgres path (KV miss or preview mode) ────────────────────
    const orgResolved = await resolveOrgByIdOrSlug(db, orgSlug)
    if (!orgResolved.found) return null

    const tourResolved = await resolveTourByIdOrSlug(db, orgResolved.organizationId, tourSlug)
    if (!tourResolved.found) return null

    const needsRedirect =
      orgResolved.needsRedirect ||
      tourResolved.needsRedirect ||
      orgSlug !== orgResolved.primarySlug ||
      tourSlug !== tourResolved.primarySlug

    if (needsRedirect && orgResolved.primarySlug && tourResolved.primarySlug) {
      if (!preview) {
        waitUntil(
          Promise.all([
            writeOrgSlugToKv(orgSlug, {
              nanoId: orgResolved.nanoId,
              primarySlug: orgResolved.primarySlug,
            }),
            writeTourSlugToKv(orgSlug, tourSlug, {
              tourNanoId: tourResolved.tourNanoId,
              primarySlug: tourResolved.primarySlug,
              orgPrimarySlug: orgResolved.primarySlug,
            }),
          ]),
        )
      }

      return {
        redirect: true as const,
        orgSlug: orgResolved.primarySlug,
        tourSlug: tourResolved.primarySlug,
      }
    }

    let isPreviewMode = false
    let tour = null

    if (preview) {
      tour = await getDraftTourByNanoId(tourResolved.tourNanoId)
      if (tour) isPreviewMode = true
    }

    if (!tour) {
      tour = await getPublishedTourByNanoId(tourResolved.tourNanoId)
    }

    if (!tour) return null

    // Backfill KV for published content
    if (!preview && orgResolved.primarySlug && tourResolved.primarySlug) {
      waitUntil(
        Promise.all([
          writeOrgSlugToKv(orgSlug, {
            nanoId: orgResolved.nanoId,
            primarySlug: orgResolved.primarySlug,
          }),
          writeTourSlugToKv(orgSlug, tourSlug, {
            tourNanoId: tourResolved.tourNanoId,
            primarySlug: tourResolved.primarySlug,
            orgPrimarySlug: orgResolved.primarySlug,
          }),
          writeTourToKv(
            tourResolved.tourNanoId,
            locale,
            serializeTourForKv(tour as Parameters<typeof serializeTourForKv>[0], locale),
          ),
        ]),
      )
    }

    return {
      redirect: false as const,
      tour,
      orgSlug: orgResolved.primarySlug ?? orgSlug,
      tourSlug: tourResolved.primarySlug ?? tourSlug,
      isPreviewMode,
    }
  })

export const Route = createFileRoute('/$orgSlug/$tourSlug')({
  validateSearch: tourSearchSchema,
  beforeLoad: async ({ params, search, context }) => {
    const result = await resolveTourFn({
      data: { ...params, preview: search.preview, locale: context.locale },
    })

    if (!result) {
      throw notFound()
    }

    if (result.redirect) {
      throw redirect({
        to: '/$orgSlug/$tourSlug',
        params: { orgSlug: result.orgSlug, tourSlug: result.tourSlug },
        search: search.preview ? { preview: true } : {},
        statusCode: 301,
      })
    }

    return {
      tour: result.tour,
      orgSlug: result.orgSlug,
      tourSlug: result.tourSlug,
      isPreviewMode: result.isPreviewMode,
    }
  },
  component: TourLayout,
})

function TourLayout() {
  const { isPreviewMode, locale } = Route.useRouteContext()

  return (
    <>
      {isPreviewMode && <PreviewBanner locale={locale} />}
      <Outlet />
    </>
  )
}
