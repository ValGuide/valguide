import { createFileRoute, useRouter } from '@tanstack/react-router'
import type { StopWithGuides } from '@/features/stops/api/fetchers'
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

  const handleEditStop = (stop: StopWithGuides) => {
    const firstGuide = stop.guideStops[0]?.guide
    if (stop.nanoId && firstGuide) {
      router.navigate({
        to: '/guides/$nanoId/stops/$stopId/edit',
        params: { nanoId: firstGuide.nanoId, stopId: stop.nanoId },
      })
    }
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <StopsList stops={stops} isLoading={isLoading} error={error} onEditStop={handleEditStop} onRetry={refetch} />
    </main>
  )
}
