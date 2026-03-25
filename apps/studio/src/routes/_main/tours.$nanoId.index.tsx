import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { clientEnv } from '@valguide/core/env/client'
import { unpublishTourLocaleFn } from '@valguide/core/features/tours/tour/locale/unpublish-tour-locale.fn'
import { publishTourFn } from '@valguide/core/features/tours/tour/publish-tour.fn'
import { updateTourFn } from '@valguide/core/features/tours/tour/update-tour.fn'
import { useTranslations } from '@valguide/core/i18n/client'
import { toast } from '@valguide/core/ui/components/sonner/state'
import { useCallback } from 'react'
import { ArchiveTourButton } from '@/features/tours/components/archive-tour-button'
import { TourDetailSkeleton } from '@/features/tours/components/tour-detail-skeleton'
import { TourDetailView } from '@/features/tours/components/tour-detail-view'
import { TourSlugSettingsConnected } from '@/features/tours/components/tour-slug-settings-connected'
import { ViewInAppButton } from '@/features/tours/components/view-in-app-button'
import { tourDetailQueryOptions } from '@/features/tours/query-options'

export const Route = createFileRoute('/_main/tours/$nanoId/')({
  loader: async ({ params, context }) => {
    await context.queryClient.ensureQueryData(tourDetailQueryOptions(params.nanoId))
    return { nanoId: params.nanoId, preferredLocale: context.locale }
  },
  component: TourPage,
  pendingComponent: TourDetailSkeleton,
})

function TourPage() {
  const { nanoId, preferredLocale } = Route.useLoaderData()
  const { data: tour } = useSuspenseQuery(tourDetailQueryOptions(nanoId))
  const queryClient = useQueryClient()
  const tLocales = useTranslations('tours.locales')
  const tPublish = useTranslations('tours.publish')
  const tUnpublish = useTranslations('tours.unpublish')
  const router = useRouter()

  const { currentTeam } = Route.useRouteContext()
  const orgSlug = currentTeam?.slug ?? ''

  const handleArchived = async () => {
    await router.navigate({ to: '/', viewTransition: false })
  }

  const handleAddLanguage = useCallback(
    async (locale: string) => {
      if (!tour) return
      try {
        await updateTourFn({
          data: { nanoId: tour.nanoId, addLocale: locale },
        })
        await queryClient.invalidateQueries({
          queryKey: ['tour', nanoId, 'detail'],
        })
      } catch {
        toast.error(tLocales('updateError'))
      }
    },
    [tour, queryClient, nanoId, tLocales],
  )

  const handleRemoveLanguage = useCallback(
    async (locale: string) => {
      if (!tour) return
      try {
        await updateTourFn({
          data: { nanoId: tour.nanoId, removeLocale: locale },
        })
        await queryClient.invalidateQueries({
          queryKey: ['tour', nanoId, 'detail'],
        })
      } catch {
        toast.error(tLocales('updateError'))
      }
    },
    [tour, queryClient, nanoId, tLocales],
  )

  const handlePublish = useCallback(
    async (locale: string) => {
      if (!tour) return
      try {
        await publishTourFn({
          data: { nanoId: tour.nanoId, locale },
        })
        await queryClient.invalidateQueries({
          queryKey: ['tour', nanoId],
        })
      } catch {
        toast.error(tPublish('tourPublishError'))
      }
    },
    [tour, queryClient, nanoId, tPublish],
  )

  const handleUnpublish = useCallback(
    async (locale: string) => {
      if (!tour) return
      try {
        await unpublishTourLocaleFn({
          data: { nanoId: tour.nanoId, locale },
        })
        await queryClient.invalidateQueries({
          queryKey: ['tour', nanoId],
        })
      } catch {
        toast.error(tUnpublish('error'))
      }
    },
    [tour, queryClient, nanoId, tUnpublish],
  )

  return (
    <TourDetailView
      tour={tour}
      nanoId={nanoId}
      preferredLocale={preferredLocale}
      appDomain={clientEnv.VITE_APP_DOMAIN}
      onBack={() => void router.navigate({ to: '/', viewTransition: false })}
      onArchived={handleArchived}
      onAddLanguage={handleAddLanguage}
      onRemoveLanguage={handleRemoveLanguage}
      onPublish={handlePublish}
      onUnpublish={handleUnpublish}
      ViewInAppButton={ViewInAppButton}
      ArchiveTourButton={ArchiveTourButton}
      SlugSettings={TourSlugSettingsConnected}
      orgSlug={orgSlug}
      currentSlug={tour.slug}
    />
  )
}
