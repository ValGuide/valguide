import { Button } from '@valguide/core/ui/components/button'
import { Popover, PopoverContent, PopoverTrigger } from '@valguide/core/ui/components/popover'
import { usePlayerActions, useSpeed } from '../store/use-player-store'
import { PLAYBACK_SPEEDS } from '../types'

type SpeedSelectorProps = {
  className?: string
}

export function SpeedSelector({ className = '' }: SpeedSelectorProps) {
  const speed = useSpeed()
  const { setSpeed } = usePlayerActions()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className={className} aria-label="Playback speed">
          {speed}x
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2" align="center">
        <div className="flex flex-col gap-1">
          {PLAYBACK_SPEEDS.map((s) => (
            <Button
              key={s}
              variant={s === speed ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setSpeed(s)}
              className="justify-center"
            >
              {s}x
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
