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
  const handleArchived = async () => {
    await router.invalidate()
    router.navigate({ to: '/' })
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
      onBack={() => router.navigate({ to: '/' })}
      onArchived={handleArchived}
      onAddLanguage={handleAddLanguage}
      onRemoveLanguage={handleRemoveLanguage}
      onPublish={handlePublish}
      onUnpublish={handleUnpublish}
      ViewInAppButton={ViewInAppButton}
      ArchiveTourButton={ArchiveTourButton}
    />
  )
}
