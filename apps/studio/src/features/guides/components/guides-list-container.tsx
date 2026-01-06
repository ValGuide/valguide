import { useRouter } from '@tanstack/react-router'
import type { GuideWithTranslations } from '@valguide/core/features/guides/schema'
import { useGuides } from '../hooks/use-guides'
import { GuidesList } from './guides-list'

export function GuidesListContainer({ teamSlug }: { teamSlug?: string }) {
  const router = useRouter()
  const { guides, isLoading, error, createGuide, refetch } = useGuides(teamSlug)

  const handleViewGuide = (guide: GuideWithTranslations) => {
    if (guide.nanoId) {
      router.navigate({ to: `/guides/${guide.nanoId}/edit` })
    }
  }

  return (
    <GuidesList
      guides={guides}
      isLoading={isLoading}
      error={error}
      onCreateGuide={createGuide}
      onViewGuide={handleViewGuide}
      onRetry={refetch}
    />
  )
}
