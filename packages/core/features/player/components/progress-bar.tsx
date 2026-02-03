import { Slider } from '@valguide/core/ui/components/slider'
import { useCurrentTime, useDuration, usePlayerActions } from '../store/use-player-store'

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

type ProgressBarProps = {
  className?: string
}

export function ProgressBar({ className = '' }: ProgressBarProps) {
  const currentTime = useCurrentTime()
  const duration = useDuration()
  const { seek } = usePlayerActions()

  const handleValueChange = (value: number[]) => {
    seek(value[0])
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <Slider
        value={[currentTime]}
        min={0}
        max={duration || 100}
        step={1}
        onValueChange={handleValueChange}
        aria-label="Playback progress"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  )
}
