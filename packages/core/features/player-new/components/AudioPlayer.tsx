'use client'

import { cn } from '@valguide/core/ui/lib/utils'
import * as React from 'react'
import type { Track } from '../types'
import { ExhibitHeader } from './ExhibitHeader'
import { ExhibitImage } from './ExhibitImage'
import { PlayerControls } from './PlayerControls'
import { ProgressBar } from './ProgressBar'
import { TranscriptDrawer } from './TranscriptDrawer'

interface AudioPlayerProps {
  track: Track
  onClose?: () => void
  className?: string
}

export function AudioPlayer({ track, onClose, className }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [currentTime, setCurrentTime] = React.useState(0)
  const [duration, setDuration] = React.useState(track.duration || 0)
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false)

  const audioRef = React.useRef<HTMLAudioElement | null>(null)

  // Initialize audio
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

  const handleRewind = () => handleSeek(Math.max(0, currentTime - 10))
  const handleForward = () => handleSeek(Math.min(duration, currentTime + 10))

  return (
    <div className={cn('fixed inset-0 z-50 flex flex-col bg-black text-white overflow-hidden', className)}>
      {/* Main Content Area */}
      <div className="relative flex-1 w-full overflow-hidden">
        <ExhibitHeader title={track.title} museumName={track.artist || 'Museum Guide'} onClose={onClose} />

        <ExhibitImage src={track.artworkUrl} alt={track.title} />

        {/* Gradient Overlay for Controls */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none" />

        <TranscriptDrawer
          transcript={track.transcript}
          currentTime={currentTime}
          isOpen={isDrawerOpen}
          onOpenChange={setIsDrawerOpen}
        />
      </div>

      {/* Bottom Player Section */}
      <div className="relative z-30 w-full bg-black pb-8 pt-4">
        <div className="container max-w-md mx-auto px-6">
          <ProgressBar currentTime={currentTime} duration={duration} onSeek={handleSeek} />

          <PlayerControls
            isPlaying={isPlaying}
            onPlayPause={togglePlayPause}
            onRewind={handleRewind}
            onForward={handleForward}
            className="mt-2"
          />
        </div>
      </div>
    </div>
  )
}
