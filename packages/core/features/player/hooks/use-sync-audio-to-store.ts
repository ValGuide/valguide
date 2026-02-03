import { useCallback, useEffect, useRef } from 'react'
import {
  useAutoPlayEnabled,
  useCurrentStop,
  useCurrentTime,
  useDuration,
  useHasNext,
  useIsPlaying,
  usePlayerActions,
  useSpeed,
} from '../store/use-player-store'
import { useAudioElement } from './use-audio-element'

/**
 * Syncs the audio element with the Zustand store.
 * Bidirectional: store changes → audio, audio events → store
 */
export function useSyncAudioToStore() {
  const currentStop = useCurrentStop()
  const isPlaying = useIsPlaying()
  const speed = useSpeed()
  const storeCurrentTime = useCurrentTime()
  const storeDuration = useDuration()
  const hasNext = useHasNext()
  const autoPlayEnabled = useAutoPlayEnabled()
  const { syncPlayback, pause, setHasEnded } = usePlayerActions()

  const lastSeekTimeRef = useRef<number | null>(null)

  const handleTimeUpdate = useCallback(
    (currentTime: number, duration: number) => {
      syncPlayback(currentTime, duration)
    },
    [syncPlayback],
  )

  const handleEnded = useCallback(() => {
    if (hasNext) {
      if (autoPlayEnabled) {
        // Set hasEnded to trigger the countdown UI
        setHasEnded(true)
      }
      // If auto-play disabled, just pause
      pause()
    } else {
      pause()
    }
  }, [hasNext, autoPlayEnabled, setHasEnded, pause])

  const handleLoadedMetadata = useCallback(
    (duration: number) => {
      syncPlayback(0, duration)
    },
    [syncPlayback],
  )

  const {
    play,
    pause: pauseAudio,
    seek,
    setPlaybackRate,
  } = useAudioElement({
    src: currentStop?.audioUrl ?? null,
    onTimeUpdate: handleTimeUpdate,
    onEnded: handleEnded,
    onLoadedMetadata: handleLoadedMetadata,
  })

  // Sync isPlaying to audio
  useEffect(() => {
    if (isPlaying) {
      play()
    } else {
      pauseAudio()
    }
  }, [isPlaying, play, pauseAudio])

  // Sync speed to audio
  useEffect(() => {
    setPlaybackRate(speed)
  }, [speed, setPlaybackRate])

  // Sync seek from store to audio (when user seeks via slider)
  useEffect(() => {
    // Only seek if the time changed significantly (user action, not playback)
    const timeDiff = Math.abs(storeCurrentTime - (lastSeekTimeRef.current ?? storeCurrentTime))
    if (timeDiff > 1) {
      seek(storeCurrentTime)
    }
    lastSeekTimeRef.current = storeCurrentTime
  }, [storeCurrentTime, seek])

  return {
    currentStop,
    isPlaying,
    speed,
    currentTime: storeCurrentTime,
    duration: storeDuration,
  }
}
