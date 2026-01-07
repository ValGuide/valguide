import { createFileRoute } from '@tanstack/react-router'
import { StopsListContainer } from '@/features/stops'
import { StopsListSkeleton } from '@/features/stops/components/stops-list-skeleton'
import { stopsQueryOptions } from '@/features/stops/query-options'

export const Route = createFileRoute('/_main/stops/')({
  loader: ({ context }) => context.queryClient.ensureQueryData(stopsQueryOptions()),
  component: StopsPage,
  pendingComponent: StopsListSkeleton,
})

function StopsPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <StopsListContainer />
    </main>
  )
}
