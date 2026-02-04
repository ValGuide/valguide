import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { clientEnv } from '@valguide/core/env/client'
import { publishTourFn } from '@valguide/core/features/tours/tour/publish-tour.fn'
import { updateTourFn } from '@valguide/core/features/tours/tour/update-tour.fn'
import { useTranslations } from '@valguide/core/i18n/client'
import { toast } from '@valguide/core/ui/components/sonner/state'
import { useCallback, useState } from 'react'
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
  const router = useRouter()
  const [isPublishing, setIsPublishing] = useState(false)

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
        toast.success(tLocales('updateSuccess'))
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
        toast.success(tLocales('updateSuccess'))
      } catch {
        toast.error(tLocales('updateError'))
      }
    },
    [tour, queryClient, nanoId, tLocales],
  )

  const handlePublish = useCallback(
    async (locale: string) => {
      if (!tour) return
      setIsPublishing(true)
      try {
        const result = await publishTourFn({
          data: { nanoId: tour.nanoId, locale },
        })
        await queryClient.invalidateQueries({
          queryKey: ['tour', nanoId],
        })
        toast.success(
          tPublish('tourPublished', {
            stopCount: result.publishedStopCount,
          }),
        )
      } catch {
        toast.error(tPublish('tourPublishError'))
      } finally {
        setIsPublishing(false)
      }
    },
    [tour, queryClient, nanoId, tPublish],
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
      isPublishing={isPublishing}
      ViewInAppButton={ViewInAppButton}
      ArchiveTourButton={ArchiveTourButton}
    />
  )
}
