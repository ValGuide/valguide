import { Image } from '@unpic/react'
import { Button } from '@valguide/core/ui/components/button'
import { Music, Pause, Play, SkipForward } from 'lucide-react'
import { useCurrentStop, useHasNext, useIsPlaying, usePlayerActions, useProgress } from '../store/use-player-store'

type MiniPlayerProps = {
  className?: string
  onExpand?: () => void
}

export function MiniPlayer({ className = '', onExpand }: MiniPlayerProps) {
  const currentStop = useCurrentStop()
  const isPlaying = useIsPlaying()
  const hasNext = useHasNext()
  const progress = useProgress()
  const { togglePlay, nextStop } = usePlayerActions()

  if (!currentStop) {
    return null
  }

  return (
    <div className={`bg-background border-t ${className}`}>
      {/* Progress bar at top */}
      <div className="h-1 bg-muted">
        <div className="h-full bg-primary transition-all duration-200" style={{ width: `${progress}%` }} />
      </div>

      <div className="flex items-center gap-3 p-3">
        {/* Thumbnail - clickable to expand */}
        <button
          type="button"
          onClick={onExpand}
          className="relative h-10 w-10 flex-shrink-0 rounded overflow-hidden bg-muted"
        >
          {currentStop.coverImageUrl ? (
            <Image
              src={currentStop.coverImageUrl}
              alt={currentStop.title}
              layout="fullWidth"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Music className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
        </button>

        {/* Title - clickable to expand */}
        <button type="button" onClick={onExpand} className="flex-1 text-left truncate min-w-0">
          <span className="font-medium truncate block">{currentStop.title}</span>
        </button>

        {/* Controls */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={togglePlay}
            className="h-9 w-9"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={nextStop}
            disabled={!hasNext}
            className="h-9 w-9"
            aria-label="Next stop"
          >
            <SkipForward className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
