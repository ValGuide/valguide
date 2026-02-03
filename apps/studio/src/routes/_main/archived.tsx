import { createFileRoute } from '@tanstack/react-router'
import { ArchivedToursListConnected } from '@/features/tours/components/archived-tours-list-connected'
import { ArchivedToursListSkeleton } from '@/features/tours/components/archived-tours-list-skeleton'
import { useArchivedTours } from '@/features/tours/hooks/use-archived-tours'
import { archivedToursQueryOptions } from '@/features/tours/query-options'

export const Route = createFileRoute('/_main/archived')({
  loader: ({ context }) => context.queryClient.ensureQueryData(archivedToursQueryOptions()),
  component: ArchivedPage,
  pendingComponent: ArchivedToursListSkeleton,
})

function ArchivedPage() {
  const { tours, isLoading, error, refetch } = useArchivedTours()

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <ArchivedToursListConnected tours={tours} isLoading={isLoading} error={error} onRetry={refetch} />
    </main>
  )
}
