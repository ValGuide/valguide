import { useEffect } from 'react'
import { usePlayerStoreContext } from '../store/player-provider'
import { useCurrentStop, useCurrentTime, useDuration, useIsPlaying } from '../store/use-player-store'

/**
 * Integrates with the Media Session API for lock screen controls.
 * Provides play/pause, seek, skip forward/backward, and next/previous controls.
 */
export function useMediaSession() {
  const store = usePlayerStoreContext()
  const currentStop = useCurrentStop()
  const isPlaying = useIsPlaying()
  const duration = useDuration()
  const currentTime = useCurrentTime()

  // Set metadata when current stop changes
  useEffect(() => {
    if (!currentStop || !('mediaSession' in navigator)) return

    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentStop.title,
      artist: 'ValGuide',
      artwork: currentStop.coverImageUrl
        ? [
            { src: currentStop.coverImageUrl, sizes: '96x96', type: 'image/png' },
            { src: currentStop.coverImageUrl, sizes: '128x128', type: 'image/png' },
            { src: currentStop.coverImageUrl, sizes: '192x192', type: 'image/png' },
            { src: currentStop.coverImageUrl, sizes: '256x256', type: 'image/png' },
            { src: currentStop.coverImageUrl, sizes: '384x384', type: 'image/png' },
            { src: currentStop.coverImageUrl, sizes: '512x512', type: 'image/png' },
          ]
        : [],
    })
  }, [currentStop])

  // Set playback state
  useEffect(() => {
    if (!('mediaSession' in navigator)) return

    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused'
  }, [isPlaying])

  // Set position state
  useEffect(() => {
    if (!('mediaSession' in navigator) || !duration) return

    try {
      navigator.mediaSession.setPositionState({
        duration,
        playbackRate: store.getState().speed,
        position: Math.min(currentTime, duration),
      })
    } catch {
      // Position state may not be supported in all browsers
    }
  }, [currentTime, duration, store])

  // Set action handlers
  useEffect(() => {
    if (!('mediaSession' in navigator)) return

    const { play, pause, skip, nextStop, prevStop, seek } = store.getState()

    navigator.mediaSession.setActionHandler('play', () => play())
    navigator.mediaSession.setActionHandler('pause', () => pause())
    navigator.mediaSession.setActionHandler('previoustrack', () => prevStop())
    navigator.mediaSession.setActionHandler('nexttrack', () => nextStop())
    navigator.mediaSession.setActionHandler('seekbackward', (details) => {
      skip(-(details.seekOffset ?? 10))
    })
    navigator.mediaSession.setActionHandler('seekforward', (details) => {
      skip(details.seekOffset ?? 10)
    })
    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime !== undefined) {
        seek(details.seekTime)
      }
    })

    return () => {
      // Clean up handlers
      navigator.mediaSession.setActionHandler('play', null)
      navigator.mediaSession.setActionHandler('pause', null)
      navigator.mediaSession.setActionHandler('previoustrack', null)
      navigator.mediaSession.setActionHandler('nexttrack', null)
      navigator.mediaSession.setActionHandler('seekbackward', null)
      navigator.mediaSession.setActionHandler('seekforward', null)
      navigator.mediaSession.setActionHandler('seekto', null)
    }
  }, [store])
}
