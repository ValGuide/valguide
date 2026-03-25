import { useEffect, useState } from 'react'

/**
 * Enables secondary work only after the first client render has committed.
 * This keeps non-critical editor queries off the initial boot path.
 */
export function useEnableAfterMount(): boolean {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    setEnabled(true)
  }, [])

  return enabled
}
