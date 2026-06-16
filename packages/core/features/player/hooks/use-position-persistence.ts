import { useEffect, useRef } from 'react'
import { useCurrentStopNanoId, useCurrentTime, usePlayerActions } from '../store/use-player-store'

const STORAGE_KEY_PREFIX = 'valguide-player-position-'
const SAVE_INTERVAL_MS = 5000

/**
 * Persists playback position to localStorage and restores on mount.
 * Saves position every 5 seconds and on stop change.
 */
export function usePositionPersistence() {
  const currentStopNanoId = useCurrentStopNanoId()
  const currentTime = useCurrentTime()
  const { seek } = usePlayerActions()
  const lastSavedTimeRef = useRef<number>(0)
  const hasRestoredRef = useRef<Set<string>>(new Set())

  // Restore position when stop changes
  useEffect(() => {
    if (!currentStopNanoId) return

    // Only restore once per stop per session
    if (hasRestoredRef.current.has(currentStopNanoId)) return

    const savedPosition = localStorage.getItem(`${STORAGE_KEY_PREFIX}${currentStopNanoId}`)
    if (savedPosition) {
      const position = Number.parseFloat(savedPosition)
      if (Number.isFinite(position) && position > 0) {
        seek(position)
      }
    }

    hasRestoredRef.current.add(currentStopNanoId)
  }, [currentStopNanoId, seek])

  // Save position periodically
  useEffect(() => {
    if (!currentStopNanoId || currentTime < 1) return

    const timeSinceLastSave = Date.now() - lastSavedTimeRef.current
    if (timeSinceLastSave < SAVE_INTERVAL_MS) return

    localStorage.setItem(`${STORAGE_KEY_PREFIX}${currentStopNanoId}`, currentTime.toString())
    lastSavedTimeRef.current = Date.now()
  }, [currentStopNanoId, currentTime])

  // Save position on stop change (cleanup)
  useEffect(() => {
    const stopNanoId = currentStopNanoId
    const time = currentTime

    return () => {
      if (stopNanoId && time > 1) {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}${stopNanoId}`, time.toString())
      }
    }
  }, [currentStopNanoId, currentTime])
}
