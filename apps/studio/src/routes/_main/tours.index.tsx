import { createFileRoute, useRouter } from '@tanstack/react-router'
import type { TourListItem } from '@valguide/core/features/tours/tour/list-tours.fn'
import { useLocale, useTranslations } from '@valguide/core/i18n/client'
import { toast } from '@valguide/core/ui/components/sonner/state'
import { ToursList } from '@/features/tours/components/tours-list'
import { ToursListSkeleton } from '@/features/tours/components/tours-list-skeleton'
import { useTours } from '@/features/tours/hooks/use-tours'
import { toursListQueryOptions } from '@/features/tours/query-options'

export const Route = createFileRoute('/_main/tours/')({
  loader: ({ context }) => {
    const locale = context.locale
    const options = toursListQueryOptions(locale)
    const cachedData = context.queryClient.getQueryData(options.queryKey)
    if (cachedData) {
      context.queryClient.invalidateQueries({ queryKey: options.queryKey })
      return cachedData
    }
    return context.queryClient.ensureQueryData(options)
  },
  component: ToursPage,
  pendingComponent: ToursListSkeleton,
})

function ToursPage() {
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('tours')
  const { tours, isLoading, error, refetch, createTour, isCreatingTour } = useTours()

  const handleViewTour = (tour: TourListItem) => {
    if (tour.nanoId) {
      router.navigate({ to: '/tours/$nanoId/edit', params: { nanoId: tour.nanoId } })
    }
  }

  const handleCreateTour = async () => {
    try {
      const createdTour = await createTour({ locale })
      await router.navigate({
        to: '/tours/$nanoId/edit',
        params: { nanoId: createdTour.nanoId },
        search: { locale: createdTour.locale },
      })
    } catch {
      toast.error(t('error.createFailed'))
    }
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <ToursList
        tours={tours}
        isLoading={isLoading}
        error={error}
        onViewTour={handleViewTour}
        onCreateTour={handleCreateTour}
        isCreatingTour={isCreatingTour}
        onRetry={refetch}
      />
    </main>
  )
}
