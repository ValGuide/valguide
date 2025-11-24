'use client'

import { useRouter } from 'next/navigation'
import { GuidesList } from './guides-list'
import { useGuides } from '../hooks/use-guides'
import { Guide } from '@valguide/features/guides/types'

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
