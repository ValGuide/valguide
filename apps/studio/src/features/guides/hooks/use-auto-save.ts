import { useEffect } from 'react'
import { useDebounceCallback } from 'usehooks-ts'

export function useAutoSave(save: () => Promise<void>, isDirty: boolean, delay = 2000, enabled = false) {
  const debouncedSave = useDebounceCallback(async () => {
    if (!isDirty) return

    try {
      await save()
    } catch (error) {
      console.error('Auto-save failed:', error)
    }
  }, delay)

  useEffect(() => {
    if (enabled && isDirty) {
      debouncedSave()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, isDirty, debouncedSave])

  // Save on unmount if dirty (only if enabled)
  useEffect(() => {
    return () => {
      if (enabled && isDirty) {
        save()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, isDirty, save])
}
