import type { QueryObserverOptions } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'
import { useCallback, useEffect, useState } from 'react'

export type FieldDiff = {
  field: string
  draft: string | null
  published: string | null
  hasChanged: boolean
}

export type UseDiffViewOptions = {
  enabled?: boolean
  /** Injectable query options - pass undefined for Storybook to skip the query */
  queryOptions?: QueryObserverOptions<DiffResult>
}

export type DiffResult = {
  hasChanges: boolean
  changedFields: string[]
  fieldDiffs: FieldDiff[]
  publishedAt: Date | null
}

export type UseDiffViewResult = {
  diffEnabled: boolean
  setDiffEnabled: (enabled: boolean) => void
  toggleDiff: () => void
  diffData: DiffResult | null | undefined
  isLoading: boolean
  hasChanges: boolean
  changedCount: number
  changedFields: string[]
  getFieldDiff: (field: string) => FieldDiff | undefined
  publishedAt: Date | null
}

const DIFF_VIEW_STORAGE_KEY = 'valguide-diff-view-enabled'

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

export function useDiffView({ enabled = true, queryOptions }: UseDiffViewOptions): UseDiffViewResult {
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

  const { data: diffData, isLoading } = useQuery<DiffResult | null>({
    queryKey: queryOptions?.queryKey ?? ['diff-view-disabled'],
    queryFn: queryOptions?.queryFn ?? (() => Promise.resolve(null)),
    enabled: enabled && !!queryOptions,
  })

  const hasChanges = diffData?.hasChanges ?? false
  const changedCount = diffData?.changedFields?.length ?? 0
  const changedFields = diffData?.changedFields ?? []
  const publishedAt = diffData?.publishedAt ?? null

  const getFieldDiff = useCallback(
    (field: string): FieldDiff | undefined => {
      return diffData?.fieldDiffs?.find((f: FieldDiff) => f.field === field)
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
