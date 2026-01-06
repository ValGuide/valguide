import { createFileRoute } from '@tanstack/react-router'

import { useTranslations } from '@valguide/core/i18n/mock'
import { ArchivedSkeleton } from '@/components/archived-skeleton'
import { ArchivedGuidesList } from '@/features/guides/components/archived-guides-list'
import { useArchivedGuides } from '@/features/guides/hooks/use-archived-guides'

export const Route = createFileRoute('/archived')({
  component: ArchivedPage,
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
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="mb-6 text-2xl font-bold sm:text-3xl">{t('archived')}</h1>
      <ArchivedGuidesList guides={data.guides} userId={data.userId} onActionComplete={refetch} />
    </div>
  )
}
