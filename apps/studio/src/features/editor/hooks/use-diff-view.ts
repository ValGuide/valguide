import { useQuery } from '@tanstack/react-query'
import type { StopLocaleDiffResult } from '@valguide/core/features/tours/stop/locale/compare-stop-locale-diff.fn'
import type {
  FieldDiff,
  TourLocaleDiffResult,
} from '@valguide/core/features/tours/tour/locale/compare-tour-locale-diff.fn'
import { useCallback, useEffect, useState } from 'react'
import { stopLocaleDiffQueryOptions, tourLocaleDiffQueryOptions } from '@/features/tours/query-options'

const DIFF_VIEW_STORAGE_KEY = 'valguide-diff-view-enabled'

export type UseDiffViewOptions = {
  type: 'tour' | 'stop'
  nanoId: string
  locale: string
  enabled?: boolean
}

export type UseDiffViewResult = {
  diffEnabled: boolean
  setDiffEnabled: (enabled: boolean) => void
  toggleDiff: () => void
  diffData: TourLocaleDiffResult | StopLocaleDiffResult | null | undefined
  isLoading: boolean
  hasChanges: boolean
  changedCount: number
  changedFields: string[]
  getFieldDiff: (field: string) => FieldDiff | undefined
  publishedAt: Date | null
}

function getStoredDiffEnabled(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return localStorage.getItem(DIFF_VIEW_STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

function setStoredDiffEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(DIFF_VIEW_STORAGE_KEY, String(enabled))
  } catch {
    // Ignore localStorage errors
  }
}

export function useDiffView({ type, nanoId, locale, enabled = true }: UseDiffViewOptions): UseDiffViewResult {
  const [diffEnabled, setDiffEnabledState] = useState(getStoredDiffEnabled)

  const setDiffEnabled = useCallback((value: boolean) => {
    setDiffEnabledState(value)
    setStoredDiffEnabled(value)
  }, [])

  const toggleDiff = useCallback(() => {
    setDiffEnabled(!diffEnabled)
  }, [diffEnabled, setDiffEnabled])

  // Handle keyboard shortcut (Cmd/Ctrl + D)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
        e.preventDefault()
        toggleDiff()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggleDiff])

  const queryOptions =
    type === 'tour' ? tourLocaleDiffQueryOptions(nanoId, locale) : stopLocaleDiffQueryOptions(nanoId, locale)

  const { data: diffData, isLoading } = useQuery({
    ...queryOptions,
    enabled,
  })

  const hasChanges = diffData?.hasChanges ?? false
  const changedCount = diffData?.changedFields.length ?? 0
  const changedFields = diffData?.changedFields ?? []
  const publishedAt = diffData?.publishedAt ?? null

  const getFieldDiff = useCallback(
    (field: string): FieldDiff | undefined => {
      return diffData?.fieldDiffs.find((f) => f.field === field)
    },
    [diffData],
  )

  return {
    diffEnabled,
    setDiffEnabled,
    toggleDiff,
    diffData,
    isLoading,
    hasChanges,
    changedCount,
    changedFields,
    getFieldDiff,
    publishedAt,
  }
}
