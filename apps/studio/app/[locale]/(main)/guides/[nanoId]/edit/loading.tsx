'use client'

// biome-ignore lint/style/noRestrictedImports: useSearchParams is only available from next/navigation
import { useSearchParams } from 'next/navigation'
import { GuideEditSkeleton } from './components/guide-edit-skeleton'
import { StopEditSkeleton } from './components/stop-edit-skeleton'

export default function GuideEditLoading() {
  const searchParams = useSearchParams()
  const stopId = searchParams.get('stop')

  return stopId ? <StopEditSkeleton /> : <GuideEditSkeleton />
}
