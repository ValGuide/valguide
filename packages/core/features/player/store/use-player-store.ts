import { useStore } from 'zustand'
import { useShallow } from 'zustand/shallow'
import type { PlayerStore } from '../types'
import { usePlayerStoreContext } from './player-provider'

export function usePlayerStore<T>(selector: (state: PlayerStore) => T): T {
  const store = usePlayerStoreContext()
  return useStore(store, selector)
}

// Convenience selectors
export const useIsPlaying = () => usePlayerStore((s) => s.isPlaying)
export const useCurrentTime = () => usePlayerStore((s) => s.currentTime)
export const useDuration = () => usePlayerStore((s) => s.duration)
export const useSpeed = () => usePlayerStore((s) => s.speed)
export const useCurrentStopNanoId = () => usePlayerStore((s) => s.currentStopNanoId)
export const useStops = () => usePlayerStore((s) => s.stops)
export const useHasEnded = () => usePlayerStore((s) => s.hasEnded)
export const useAutoPlayEnabled = () => usePlayerStore((s) => s.autoPlayEnabled)

export const useCurrentStop = () =>
  usePlayerStore((s) => {
    if (!s.currentStopNanoId) return null
    return s.stops.find((stop) => stop.nanoId === s.currentStopNanoId) ?? null
  })

export const useHasNext = () =>
  usePlayerStore((s) => {
    if (!s.currentStopNanoId) return false
    const currentIndex = s.stops.findIndex((stop) => stop.nanoId === s.currentStopNanoId)
    return currentIndex < s.stops.length - 1
  })

export const useHasPrev = () =>
  usePlayerStore((s) => {
    if (!s.currentStopNanoId) return false
    const currentIndex = s.stops.findIndex((stop) => stop.nanoId === s.currentStopNanoId)
    return currentIndex > 0
  })

export const useProgress = () =>
  usePlayerStore((s) => {
    if (s.duration === 0) return 0
    return (s.currentTime / s.duration) * 100
  })

export const useCurrentStopIndex = () =>
  usePlayerStore((s) => {
    if (!s.currentStopNanoId) return -1
    return s.stops.findIndex((stop) => stop.nanoId === s.currentStopNanoId)
  })

// Actions (stable references via useShallow)
export const usePlayerActions = () => {
  const store = usePlayerStoreContext()
  return useStore(
    store,
    useShallow((s) => ({
      play: s.play,
      pause: s.pause,
      togglePlay: s.togglePlay,
      seek: s.seek,
      skip: s.skip,
      setSpeed: s.setSpeed,
      nextStop: s.nextStop,
      prevStop: s.prevStop,
      setCurrentStop: s.setCurrentStop,
      setStops: s.setStops,
      syncPlayback: s.syncPlayback,
      reset: s.reset,
      setHasEnded: s.setHasEnded,
      setAutoPlayEnabled: s.setAutoPlayEnabled,
    })),
  )
}
