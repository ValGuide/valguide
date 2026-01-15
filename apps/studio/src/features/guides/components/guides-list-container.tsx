import { useRouter } from '@tanstack/react-router'
import type { GuideListItem } from '@valguide/core/features/guides/types'
import { useGuides } from '../hooks/use-guides'
import { GuidesList } from './guides-list'

export function GuidesListContainer({ teamSlug }: { teamSlug?: string }) {
  const router = useRouter()
  const { guides, isLoading, error, createGuide, refetch } = useGuides(teamSlug)

  const handleViewGuide = (guide: GuideListItem) => {
    if (guide.nanoId) {
      router.navigate({ to: `/guides/${guide.nanoId}/edit` })
    }
  }

  const handleNavigateToGuide = (nanoId: string) => {
    router.navigate({ to: `/guides/${nanoId}/edit` })
  }

  return (
    <GuidesList
      guides={guides}
      isLoading={isLoading}
      error={error}
      onCreateGuide={createGuide}
      onViewGuide={handleViewGuide}
      onNavigateToGuide={handleNavigateToGuide}
      onRetry={refetch}
    />
  )
}
