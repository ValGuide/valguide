import { useCallback, useEffect, useRef } from 'react'

type UseAudioElementOptions = {
  src: string | null
  onTimeUpdate?: (currentTime: number, duration: number) => void
  onEnded?: () => void
  onLoadedMetadata?: (duration: number) => void
}

export function useAudioElement({ src, onTimeUpdate, onEnded, onLoadedMetadata }: UseAudioElementOptions) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const onTimeUpdateRef = useRef(onTimeUpdate)
  const onEndedRef = useRef(onEnded)
  const onLoadedMetadataRef = useRef(onLoadedMetadata)

  onTimeUpdateRef.current = onTimeUpdate
  onEndedRef.current = onEnded
  onLoadedMetadataRef.current = onLoadedMetadata

  useEffect(() => {
    if (!src) return

    const audio = new Audio(src)
    audio.preload = 'metadata'
    audioRef.current = audio

    const handleTimeUpdate = () => {
      onTimeUpdateRef.current?.(audio.currentTime, audio.duration || 0)
    }

    const handleLoadedMetadata = () => {
      onLoadedMetadataRef.current?.(audio.duration || 0)
    }

    const handleEnded = () => {
      onEndedRef.current?.()
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.pause()
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('ended', handleEnded)
      audioRef.current = null
    }
  }, [src])

  const play = useCallback(() => {
    audioRef.current?.play()
  }, [])

  const pause = useCallback(() => {
    audioRef.current?.pause()
  }, [])

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time
    }
  }, [])

  const setPlaybackRate = useCallback((rate: number) => {
    if (audioRef.current) {
      audioRef.current.playbackRate = rate
    }
  }, [])

  return {
    audioRef,
    play,
    pause,
    seek,
    setPlaybackRate,
  }
}
