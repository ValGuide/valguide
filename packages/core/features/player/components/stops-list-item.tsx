import { RevealImage } from '@valguide/core/ui/components/reveal-image'
import { Music, Pause, Play } from 'lucide-react'
import type { PlayerStop } from '../types'

function formatDuration(seconds?: number): string {
  if (!seconds || !Number.isFinite(seconds)) return '--:--'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

type StopsListItemProps = {
  stop: PlayerStop
  index: number
  isPlaying: boolean
  isCurrent: boolean
  onSelect: (nanoId: string) => void
}

export function StopsListItem({ stop, index, isPlaying, isCurrent, onSelect }: StopsListItemProps) {
  const stopNumber = index + 1

  return (
    <button
      type="button"
      onClick={() => onSelect(stop.nanoId)}
      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
        isCurrent ? 'bg-primary/10' : 'hover:bg-muted'
      }`}
    >
      <div className="relative h-12 w-12 flex-shrink-0 rounded-md overflow-hidden bg-muted">
        {stop.coverImageUrl ? (
          <RevealImage
            src={stop.coverImageUrl}
            alt={stop.title}
            layout="constrained"
            width={48}
            height={48}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Music className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
        {isCurrent && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            {isPlaying ? <Pause className="h-5 w-5 text-white" /> : <Play className="h-5 w-5 text-white ml-0.5" />}
          </div>
        )}
      </div>

      <span className="text-sm text-muted-foreground w-6 flex-shrink-0">{stopNumber}</span>

      <span className={`flex-1 truncate ${isCurrent ? 'font-semibold' : ''}`}>{stop.title}</span>

      <span className="text-sm text-muted-foreground flex-shrink-0">{formatDuration(stop.duration)}</span>
    </button>
  )
}
