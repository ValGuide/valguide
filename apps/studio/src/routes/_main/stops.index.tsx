import { createFileRoute, useRouter } from '@tanstack/react-router'
import type { StopListItem } from '@valguide/core/features/guides/stop/list-stops'
import { StopsList } from '@/features/stops/components/stops-list'
import { StopsListSkeleton } from '@/features/stops/components/stops-list-skeleton'
import { useStops } from '@/features/stops/hooks/use-stops'
import { stopsQueryOptions } from '@/features/stops/query-options'

export const Route = createFileRoute('/_main/stops/')({
  loader: ({ context }) => context.queryClient.ensureQueryData(stopsQueryOptions()),
  component: StopsPage,
  pendingComponent: StopsListSkeleton,
})

function StopsPage() {
  const router = useRouter()

  const { stops, isLoading, error, refetch } = useStops()

  const handleEditStop = (stop: StopListItem) => {
    router.navigate({
      to: '/stops/$nanoId',
      params: { nanoId: stop.nanoId },
    })
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <StopsList stops={stops} isLoading={isLoading} error={error} onEditStop={handleEditStop} onRetry={refetch} />
    </main>
  )
}
