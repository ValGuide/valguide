import * as React from 'react'
import { Repeat, Shuffle, SkipBack, SkipForward } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { motion } from 'framer-motion'

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
    // Animation variants for control buttons
    const buttonVariants = {
      initial: { scale: 1 },
      hover: { scale: 1.1, transition: { duration: 0.2 } },
      tap: { scale: 0.95, transition: { duration: 0.1 } },
      active: {
        scale: [1, 1.05, 1],
        transition: {
          repeat: Infinity,
          repeatType: 'reverse',
          duration: 1.5,
        },
      },
    }

    return (
      <motion.div
        className={cn(playerControlsVariants({ variant, size, className }))}
        ref={ref}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        {...props}
      >
        {showShuffleButton && (
          <motion.button
            type="button"
            onClick={onToggleShuffle}
            className={cn(
              'text-muted-foreground hover:text-foreground',
              shuffleActive && 'text-primary hover:text-primary/80',
            )}
            aria-label="Shuffle"
            initial="initial"
            whileHover="hover"
            whileTap="tap"
            animate={shuffleActive ? 'active' : 'initial'}
            variants={buttonVariants}
          >
            <Shuffle className="h-4 w-4" />
          </motion.button>
        )}

        {showSkipControls && (
          <motion.button
            type="button"
            onClick={onSkipPrevious}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Previous track"
            initial="initial"
            whileHover="hover"
            whileTap="tap"
            variants={buttonVariants}
          >
            <SkipBack className="h-4 w-4" />
          </motion.button>
        )}

        <PlayButton
          isPlaying={isPlaying}
          onClick={onPlayPause}
          variant="default"
          size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'default'}
        />

        {showSkipControls && (
          <motion.button
            type="button"
            onClick={onSkipNext}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Next track"
            initial="initial"
            whileHover="hover"
            whileTap="tap"
            variants={buttonVariants}
          >
            <SkipForward className="h-4 w-4" />
          </motion.button>
        )}

        {showRepeatButton && (
          <motion.button
            type="button"
            onClick={onToggleRepeat}
            className={cn(
              'text-muted-foreground hover:text-foreground',
              repeatActive && 'text-primary hover:text-primary/80',
            )}
            aria-label="Repeat"
            initial="initial"
            whileHover="hover"
            whileTap="tap"
            animate={repeatActive ? 'active' : 'initial'}
            variants={buttonVariants}
          >
            <Repeat className="h-4 w-4" />
          </motion.button>
        )}
      </motion.div>
    )
  },
)
PlayerControls.displayName = 'PlayerControls'

export { PlayerControls }
