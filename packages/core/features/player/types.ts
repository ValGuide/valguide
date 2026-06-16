/**
 * Player types for the visitor audio player.
 * Used across apps/app and apps/studio for audio playback.
 */

export type PlayerStop = {
  nanoId: string
  title: string
  audioUrl: string | null
  coverImageUrl?: string | null
  duration?: number
}

export type PlayerState = {
  isPlaying: boolean
  currentTime: number
  duration: number
  speed: number
  currentStopNanoId: string | null
  stops: PlayerStop[]
  /** Whether the current track has ended (for auto-play countdown) */
  hasEnded: boolean
  /** Whether to auto-play next stop after current ends */
  autoPlayEnabled: boolean
}

export type PlayerActions = {
  play: () => void
  pause: () => void
  togglePlay: () => void
  seek: (time: number) => void
  setSpeed: (speed: number) => void
  nextStop: () => void
  prevStop: () => void
  setCurrentStop: (nanoId: string) => void
  setStops: (stops: PlayerStop[]) => void
  syncPlayback: (time: number, duration: number) => void
  reset: () => void
  setHasEnded: (hasEnded: boolean) => void
  setAutoPlayEnabled: (enabled: boolean) => void
}

export type PlayerStore = PlayerState & PlayerActions

export const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2] as const
