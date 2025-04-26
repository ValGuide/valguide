import * as React from 'react'
import { Repeat, Shuffle, SkipBack, SkipForward } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@valguide/ui/lib/utils'
import { DataTestIdProps } from '@valguide/ui/lib/types'
import { PlayButton } from './play-button'

const playerControlsVariants = cva('flex items-center gap-2', {
  variants: {
    variant: {
      default: '',
      compact: 'gap-1',
    },
    size: {
      default: '',
      sm: 'scale-90',
      lg: 'scale-110',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
})

export interface PlayerControlsProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof playerControlsVariants> {
  isPlaying?: boolean
  onPlayPause?: () => void
  onSkipNext?: () => void
  onSkipPrevious?: () => void
  onToggleShuffle?: () => void
  onToggleRepeat?: () => void
  shuffleActive?: boolean
  repeatActive?: boolean
  showSkipControls?: boolean
  showShuffleButton?: boolean
  showRepeatButton?: boolean
}

const PlayerControls = React.forwardRef<HTMLDivElement, PlayerControlsProps & DataTestIdProps>(
  (
    {
      className,
      variant,
      size,
      isPlaying = false,
      onPlayPause,
      onSkipNext,
      onSkipPrevious,
      onToggleShuffle,
      onToggleRepeat,
      shuffleActive = false,
      repeatActive = false,
      showSkipControls = true,
      showShuffleButton = true,
      showRepeatButton = true,
      ...props
    },
    ref,
  ) => {
    return (
      <div className={cn(playerControlsVariants({ variant, size, className }))} ref={ref} {...props}>
        {showShuffleButton && (
          <button
            type="button"
            onClick={onToggleShuffle}
            className={cn(
              'text-muted-foreground hover:text-foreground',
              shuffleActive && 'text-primary hover:text-primary/80',
            )}
            aria-label="Shuffle"
          >
            <Shuffle className="h-4 w-4" />
          </button>
        )}

        {showSkipControls && (
          <button
            type="button"
            onClick={onSkipPrevious}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Previous track"
          >
            <SkipBack className="h-4 w-4" />
          </button>
        )}

        <PlayButton
          isPlaying={isPlaying}
          onClick={onPlayPause}
          variant="default"
          size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'default'}
        />

        {showSkipControls && (
          <button
            type="button"
            onClick={onSkipNext}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Next track"
          >
            <SkipForward className="h-4 w-4" />
          </button>
        )}

        {showRepeatButton && (
          <button
            type="button"
            onClick={onToggleRepeat}
            className={cn(
              'text-muted-foreground hover:text-foreground',
              repeatActive && 'text-primary hover:text-primary/80',
            )}
            aria-label="Repeat"
          >
            <Repeat className="h-4 w-4" />
          </button>
        )}
      </div>
    )
  },
)
PlayerControls.displayName = 'PlayerControls'

export { PlayerControls }
