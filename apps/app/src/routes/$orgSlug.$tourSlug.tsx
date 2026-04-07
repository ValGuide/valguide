import { createFileRoute, notFound, Outlet, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getAssetUrl } from '@valguide/core/features/assets/image-url'
import { db } from '@valguide/core/features/db'
import { resolveOrgByIdOrSlug } from '@valguide/core/features/orgs/resolve-org.server'
import { buildThemeFontPreloadLinks, buildThemeFontStylesheetLinks } from '@valguide/core/features/themes/fonts'
import { getDraftTourByNanoId } from '@valguide/core/features/tours/public/get-draft-tour'
import { getPublishedTourByNanoId } from '@valguide/core/features/tours/public/get-published-tour'
import {
  readTourFromKv,
  readTourSharedFromKv,
  resolveOrgSlugFromKv,
  resolveTourSlugFromKv,
  writeOrgSlugToKv,
  writeTourSharedToKv,
  writeTourSlugToKv,
  writeTourToKv,
} from '@valguide/core/features/tours/public/kv'
import {
  serializeTourForKv,
  serializeTourSharedForKv,
  tourKvDataToTourWithStops,
} from '@valguide/core/features/tours/public/kv-serializers'
import { resolveTourByIdOrSlug } from '@valguide/core/features/tours/tour/slug/resolve-tour.server'
import { waitUntil } from '@valguide/core/utils/wait-until'
import { useEffect, useRef } from 'react'
import { z } from 'zod'
import { PreviewBanner } from '@/components/preview-banner'
import { resolveTourLocaleState } from '@/features/i18n/tour-locale-state'
import { notifyServiceWorker } from '@/sw'

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

        const [tourKvData, sharedTourKvData] = await Promise.all([
          readTourFromKv(tourKv.tourNanoId, locale),
          readTourSharedFromKv(tourKv.tourNanoId),
        ])
        if (tourKvData) {
          return {
            redirect: false as const,
            tour: tourKvDataToTourWithStops(tourKvData, sharedTourKvData),
            orgSlug: orgKv.primarySlug,
            tourSlug: tourKv.primarySlug,
            isPreviewMode: false,
          }
        }

        // Tour data KV miss — Postgres fallback for data only
        const tour = await getPublishedTourByNanoId(tourKv.tourNanoId)
        if (!tour) return null

        waitUntil(
          Promise.all([
            writeTourToKv(tourKv.tourNanoId, locale, serializeTourForKv(tour, locale)),
            writeTourSharedToKv(tourKv.tourNanoId, serializeTourSharedForKv(tour)),
          ]),
        )

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
          writeTourSharedToKv(
            tourResolved.tourNanoId,
            serializeTourSharedForKv(tour as Parameters<typeof serializeTourSharedForKv>[0]),
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

    const tourLocaleState = resolveTourLocaleState({
      currentLocale: context.locale,
      hasLocaleCookie: context.localeState.hasLocaleCookie,
      availableLocales: result.tour.availableLocales,
    })

    return {
      tour: result.tour,
      orgSlug: result.orgSlug,
      tourSlug: result.tourSlug,
      isPreviewMode: result.isPreviewMode,
      tourLocaleState,
    }
  },
  head: ({ match }) => ({
    links: match.context.tour?.theme
      ? [
          ...buildThemeFontPreloadLinks(match.context.tour.theme.fonts),
          ...buildThemeFontStylesheetLinks(match.context.tour.theme.fonts),
        ]
      : [],
  }),
  component: TourLayout,
})

function TourLayout() {
  const { tour, isPreviewMode, locale } = Route.useRouteContext()
  const offlineShownRef = useRef(false)

  useEffect(() => {
    if (isPreviewMode) return

    const audioUrls = tour.stops
      .flatMap((s) => s.assets)
      .filter((a) => a.type === 'audio')
      .map((a) => getAssetUrl(a.storagePath))

    notifyServiceWorker({
      type: 'TOUR_OPENED',
      audioUrls,
      tourKey: tour.nanoId,
    })
  }, [tour.nanoId, isPreviewMode])

  useEffect(() => {
    if (isPreviewMode) return

    const sw = navigator.serviceWorker
    if (!sw) return

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'TOUR_READY_OFFLINE' && event.data.tourKey === tour.nanoId && !offlineShownRef.current) {
        offlineShownRef.current = true
        console.log('[offline-debug] Tour ready offline', {
          tourKey: event.data.tourKey,
        })
      }
    }

    sw.addEventListener('message', handleMessage)
    return () => sw.removeEventListener('message', handleMessage)
  }, [tour.nanoId, isPreviewMode])

  return (
    <>
      {isPreviewMode && <PreviewBanner locale={locale} />}
      <Outlet />
    </>
  )
}
