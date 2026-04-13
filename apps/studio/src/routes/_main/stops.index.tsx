import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import type { StopListItem } from '@valguide/core/features/tours/stop/list-stops.fn'
import { useLocale } from '@valguide/core/i18n/client'
import { StopsList } from '@/features/stops/components/stops-list'
import { StopsListSkeleton } from '@/features/stops/components/stops-list-skeleton'
import { stopsQueryOptions } from '@/features/stops/query-options'

export const Route = createFileRoute('/_main/stops/')({
  loader: ({ context }) => context.queryClient.ensureQueryData(stopsQueryOptions(context.locale)),
  component: StopsPage,
  pendingComponent: StopsListSkeleton,
})

function StopsPage() {
  const router = useRouter()
  const locale = useLocale()
  const { data: stops } = useSuspenseQuery(stopsQueryOptions(locale))

  const handleEditStop = (stop: StopListItem) => {
    router.navigate({
      to: '/stops/$nanoId',
      params: { nanoId: stop.nanoId },
    })
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <StopsList stops={stops} onEditStop={handleEditStop} />
    </main>
  )
}
