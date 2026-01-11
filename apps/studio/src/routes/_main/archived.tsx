import { createFileRoute } from '@tanstack/react-router'
import { useTranslations } from '@valguide/core/i18n/client'
import { ArchivedSkeleton } from '@/components/archived-skeleton'
import { ArchivedGuidesList } from '@/features/guides/components/archived-guides-list'
import { useArchivedGuides } from '@/features/guides/hooks/use-archived-guides'
import { archivedGuidesQueryOptions } from '@/features/guides/query-options'

export const Route = createFileRoute('/_main/archived')({
  component: ArchivedPage,
  loader: ({ context }) => context.queryClient.ensureQueryData(archivedGuidesQueryOptions()),
  pendingComponent: ArchivedSkeleton,
})

function ArchivedPage() {
  const t = useTranslations('guides')
  const { data, isLoading, refetch } = useArchivedGuides()

  if (isLoading) {
    return <ArchivedSkeleton />
  }

  if (!data) {
    return null
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="mx-auto w-full max-w-5xl space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">{t('archived')}</h2>
            <p className="text-sm text-muted-foreground">{t('archivedDescription')}</p>
          </div>
        </div>
        <ArchivedGuidesList guides={data.guides} userId={data.userId} onActionComplete={refetch} />
      </div>
    </main>
  )
}
