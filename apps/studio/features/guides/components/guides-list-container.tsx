'use client'

import { GuidesList } from './guides-list'
import { useGuides } from '../hooks/use-guides'

export function GuidesListContainer() {
  const { guides, isLoading, error, createGuide } = useGuides()

  return <GuidesList guides={guides} isLoading={isLoading} error={error} onCreateGuide={createGuide} />
}
