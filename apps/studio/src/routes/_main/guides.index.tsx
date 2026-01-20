import { createFileRoute, useRouter } from '@tanstack/react-router'
import type { GuideListItem } from '@valguide/features/guides/types'
import { GuidesList } from '@/features/guides/components/guides-list'
import { GuidesListSkeleton } from '@/features/guides/components/guides-list-skeleton'
import { useGuides } from '@/features/guides/hooks/use-guides'
import { guidesListQueryOptions } from '@/features/guides/query-options'

export const Route = createFileRoute('/_main/guides/')({
  loader: ({ context }) => {
    const locale = context.locale
    const options = guidesListQueryOptions(locale)
    const cachedData = context.queryClient.getQueryData(options.queryKey)
    if (cachedData) {
      context.queryClient.invalidateQueries({ queryKey: options.queryKey })
      return cachedData
    }
    return context.queryClient.ensureQueryData(options)
  },
  component: GuidesPage,
  pendingComponent: GuidesListSkeleton,
})

function GuidesPage() {
  const router = useRouter()
  const { guides, isLoading, error, createGuide, refetch } = useGuides()

  const handleViewGuide = (guide: GuideListItem) => {
    if (guide.nanoId) {
      router.navigate({ to: '/guides/$nanoId/edit', params: { nanoId: guide.nanoId } })
    }
  }

  const handleNavigateToGuide = (nanoId: string) => {
    router.navigate({ to: '/guides/$nanoId/edit', params: { nanoId } })
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <GuidesList
        guides={guides}
        isLoading={isLoading}
        error={error}
        onCreateGuide={createGuide}
        onViewGuide={handleViewGuide}
        onNavigateToGuide={handleNavigateToGuide}
        onRetry={refetch}
      />
    </main>
  )
}
