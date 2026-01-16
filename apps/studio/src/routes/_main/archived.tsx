import { createFileRoute } from '@tanstack/react-router'
import { useTranslations } from '@valguide/core/i18n/client'
import { PageTitle } from '@valguide/ui/components/page-title'
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
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <div className="space-y-1">
          <PageTitle as="h2">{t('archived.title')}</PageTitle>
          <p className="text-sm text-muted-foreground">{t('archived.description')}</p>
        </div>
        <ArchivedGuidesList guides={data.guides} userId={data.userId} onActionComplete={refetch} />
      </div>
    </main>
  )
}
