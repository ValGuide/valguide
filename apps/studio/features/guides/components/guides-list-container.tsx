'use client'

import { useRouter } from 'next/navigation'
import { GuidesList } from './guides-list'
import { useGuides } from '../hooks/use-guides'
import { Guide } from '@valguide/features/guides/types'

export function GuidesListContainer() {
  const router = useRouter()
  const { guides, isLoading, error, createGuide } = useGuides()

  const handleViewGuide = (guide: Guide) => {
    if (guide.nanoId) {
      router.push(`/guides/${guide.nanoId}`)
    }
  }

  return (
    <GuidesList
      guides={guides}
      isLoading={isLoading}
      error={error}
      onCreateGuide={createGuide}
      onViewGuide={handleViewGuide}
    />
  )
}
