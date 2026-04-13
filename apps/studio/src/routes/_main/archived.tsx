import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { ArchivedToursListConnected } from '@/features/tours/components/archived-tours-list-connected'
import { ArchivedToursListSkeleton } from '@/features/tours/components/archived-tours-list-skeleton'
import { archivedToursQueryOptions } from '@/features/tours/query-options'

export const Route = createFileRoute('/_main/archived')({
  loader: ({ context }) => context.queryClient.ensureQueryData(archivedToursQueryOptions()),
  component: ArchivedPage,
  pendingComponent: ArchivedToursListSkeleton,
})

function ArchivedPage() {
  const { data: tours } = useSuspenseQuery(archivedToursQueryOptions())

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <ArchivedToursListConnected tours={tours} />
    </main>
  )
}
