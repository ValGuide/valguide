import { createFileRoute } from '@tanstack/react-router'
import { ArchivedGuidesList } from '@/features/guides/components/archived-guides-list'
import { ArchivedGuidesListLoading } from '@/features/guides/components/archived-guides-list-loading'
import { useArchivedGuides } from '@/features/guides/hooks/use-archived-guides'
import { archivedGuidesQueryOptions } from '@/features/guides/query-options'

export const Route = createFileRoute('/_main/archived')({
  loader: ({ context }) => context.queryClient.ensureQueryData(archivedGuidesQueryOptions()),
  component: ArchivedPage,
  pendingComponent: ArchivedGuidesListLoading,
})

function ArchivedPage() {
  const { guides, isLoading, error, refetch } = useArchivedGuides()

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <ArchivedGuidesList guides={guides} isLoading={isLoading} error={error} onRetry={refetch} />
    </main>
  )
}
