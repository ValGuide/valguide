
import type { Guide } from '@valguide/features/guides/types'
import { useRouter } from '@valguide/i18n/routing'
import { useGuides } from '../hooks/use-guides'
import { GuidesList } from './guides-list'

export function GuidesListContainer({ teamSlug }: { teamSlug?: string }) {
  const router = useRouter()
  const { guides, isLoading, error, createGuide, refetch } = useGuides(teamSlug)

  const handleViewGuide = (guide: Guide) => {
    if (guide.nanoId) {
      router.push(`/guides/${guide.nanoId}/edit`)
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
