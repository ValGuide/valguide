import { useEffect, useRef } from 'react'
import { useDebounceCallback } from 'usehooks-ts'

export function useAutoSave(save: () => Promise<void>, isDirty: boolean, delay = 2000) {
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null)

  const debouncedSave = useDebounceCallback(async () => {
    if (!isDirty) return

    try {
      await save()
    } catch (error) {
      console.error('Auto-save failed:', error)
    }
  }, delay)

  useEffect(() => {
    if (isDirty) {
      debouncedSave()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDirty])

  // Save on unmount if dirty
  useEffect(() => {
    return () => {
      if (isDirty) {
        save()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
