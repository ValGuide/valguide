import { Button } from '@valguide/core/ui/components/button'
import { Pause, Play, RotateCcw, RotateCw, SkipBack, SkipForward } from 'lucide-react'
import { useHasNext, useHasPrev, useIsPlaying, usePlayerActions } from '../store/use-player-store'
import { DEFAULT_SKIP_SECONDS } from '../types'

type PlayerControlsProps = {
  className?: string
}

export function PlayerControls({ className = '' }: PlayerControlsProps) {
  const isPlaying = useIsPlaying()
  const hasNext = useHasNext()
  const hasPrev = useHasPrev()
  const { togglePlay, skip, nextStop, prevStop } = usePlayerActions()

  return (
    <div className={`flex items-center justify-center gap-2 sm:gap-4 ${className}`}>
      {/* Skip back 10s */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => skip(-DEFAULT_SKIP_SECONDS)}
        aria-label={`Skip back ${DEFAULT_SKIP_SECONDS} seconds`}
        className="relative"
      >
        <RotateCcw className="h-5 w-5" />
        <span className="absolute text-[10px] font-medium">{DEFAULT_SKIP_SECONDS}</span>
      </Button>

      {/* Previous stop */}
      <Button variant="ghost" size="icon" onClick={prevStop} disabled={!hasPrev} aria-label="Previous stop">
        <SkipBack className="h-5 w-5" />
      </Button>

      {/* Play/Pause */}
      <Button
        variant="default"
        size="icon"
        onClick={togglePlay}
        className="h-14 w-14 rounded-full"
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
      </Button>

      {/* Next stop */}
      <Button variant="ghost" size="icon" onClick={nextStop} disabled={!hasNext} aria-label="Next stop">
        <SkipForward className="h-5 w-5" />
      </Button>

      {/* Skip forward 10s */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => skip(DEFAULT_SKIP_SECONDS)}
        aria-label={`Skip forward ${DEFAULT_SKIP_SECONDS} seconds`}
        className="relative"
      >
        <RotateCw className="h-5 w-5" />
        <span className="absolute text-[10px] font-medium">{DEFAULT_SKIP_SECONDS}</span>
      </Button>
    </div>
  )
}
