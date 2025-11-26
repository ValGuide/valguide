export interface Track {
  id: string
  title: string
  artist?: string // Museum name or artist
  artworkUrl: string
  audioUrl: string
  duration: number // in seconds
  transcript?: TranscriptSegment[]
}

export interface TranscriptSegment {
  id: string
  startTime: number
  endTime: number
  text: string
}

export interface PlayerState {
  isPlaying: boolean
  currentTime: number
  volume: number
  isMuted: boolean
  isTranscriptOpen: boolean
}
