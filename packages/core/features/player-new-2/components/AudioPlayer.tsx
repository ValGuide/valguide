
import { cn } from '@valguide/core/ui/lib/utils'
import { ChevronDown } from 'lucide-react'
import * as React from 'react'
import type { Track } from '../types'
import { ExhibitHeader } from './ExhibitHeader'
import { ExhibitImage } from './ExhibitImage'
import { PlaybackOptions } from './PlaybackOptions'
import { PlayerControls } from './PlayerControls'
import { ProgressBar } from './ProgressBar'

interface AudioPlayerProps {
  track: Track
  onClose?: () => void
  onSkipPrevious?: () => void
  onSkipNext?: () => void
  className?: string
}

export function AudioPlayer({ track, onClose, onSkipPrevious, onSkipNext, className }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [currentTime, setCurrentTime] = React.useState(0)
  const [duration, setDuration] = React.useState(track.duration || 0)
  const [playbackSpeed, setPlaybackSpeed] = React.useState(1.0)

  const audioRef = React.useRef<HTMLAudioElement | null>(null)

  React.useEffect(() => {
    const audio = new Audio(track.audioUrl)
    audioRef.current = audio

    audio.addEventListener('timeupdate', () => setCurrentTime(audio.currentTime))
    audio.addEventListener('loadedmetadata', () => setDuration(audio.duration))
    audio.addEventListener('ended', () => setIsPlaying(false))

    return () => {
      audio.pause()
      audio.remove()
    }
  }, [track.audioUrl])

  React.useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed
    }
  }, [playbackSpeed])

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleSeek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const handleRewind = () => handleSeek(Math.max(0, currentTime - 15))
  const handleForward = () => handleSeek(Math.min(duration, currentTime + 15))

  const handleSpeedChange = () => {
    const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0]
    const currentIndex = speeds.indexOf(playbackSpeed)
    const nextIndex = (currentIndex + 1) % speeds.length
    setPlaybackSpeed(speeds[nextIndex] ?? 1.0)
  }

  return (
    <div
      className={cn('fixed inset-0 z-50 flex flex-col bg-white overflow-hidden', className)}
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {/* Header with close button */}
      <div className="flex items-center justify-center relative px-4 py-3 flex-shrink-0">
        <button
          type="button"
          onClick={onClose}
          className="absolute left-4 p-2 text-black hover:text-gray-700 transition-colors rounded-full hover:bg-gray-100"
          aria-label="Close"
        >
          <ChevronDown size={24} />
        </button>
      </div>

      {/* Scrollable content area */}
      <div className="flex-1 flex flex-col overflow-y-auto min-h-0">
        <div className="flex-1 flex flex-col px-5 sm:px-8 max-w-lg mx-auto w-full">
          {/* Image - centered and responsive */}
          <div className="flex-shrink-0 flex items-center justify-center py-4 sm:py-6 lg:py-8">
            <ExhibitImage
              src={track.artworkUrl}
              alt={track.title}
              className="w-full max-w-[280px] sm:max-w-[320px] md:max-w-[380px]"
            />
          </div>

          {/* Track info */}
          <ExhibitHeader title={track.title} subtitle={track.artist ?? 'Museum Guide'} className="mb-4 sm:mb-6" />

          {/* Playback options */}
          <PlaybackOptions playbackSpeed={playbackSpeed} onSpeedChange={handleSpeedChange} className="mb-3 sm:mb-4" />

          {/* Progress bar */}
          <ProgressBar currentTime={currentTime} duration={duration} onSeek={handleSeek} className="mb-2 sm:mb-4" />
        </div>
      </div>

      {/* Fixed bottom controls */}
      <div className="flex-shrink-0 px-5 sm:px-8 pb-6 pt-2 bg-white border-t border-gray-100">
        <div className="max-w-lg mx-auto w-full">
          <PlayerControls
            isPlaying={isPlaying}
            onPlayPause={togglePlayPause}
            onRewind={handleRewind}
            onForward={handleForward}
            onSkipPrevious={onSkipPrevious}
            onSkipNext={onSkipNext}
          />
        </div>
      </div>
    </div>
  )
}
