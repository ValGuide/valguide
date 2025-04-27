import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { motion, AnimatePresence } from 'framer-motion'

import { cn } from '@valguide/ui/lib/utils'
import { DataTestIdProps } from '@valguide/ui/lib/types'
import { AspectRatio } from '@valguide/ui/components/aspect-ratio'
import { Player, PlayerProps } from './player'
import { useHover } from 'usehooks-ts'

const playerViewVariants = cva('relative flex flex-col overflow-hidden rounded-lg', {
  variants: {
    variant: {
      default: 'w-full max-w-3xl mx-auto',
      fullscreen: 'w-full h-full',
    },
    imageRatio: {
      square: '', // Will use 1/1 aspect ratio
      original: '', // Will use original image ratio
    },
  },
  defaultVariants: {
    variant: 'default',
    imageRatio: 'square',
  },
})

export interface PlayerViewProps
  extends Omit<PlayerProps, 'layout' | 'variant'>,
    VariantProps<typeof playerViewVariants> {
  image: string
  aspectRatio?: number // Only used when imageRatio is 'original'
}

const PlayerView = React.forwardRef<HTMLDivElement, PlayerViewProps & DataTestIdProps>(
  (
    {
      className,
      variant,
      imageRatio,
      image,
      aspectRatio = 16 / 9, // Default aspect ratio if not specified
      title,
      artist,
      albumArt,
      isPlaying = false,
      currentTime,
      duration,
      progress = 0,
      volume = 50,
      shuffleActive = false,
      repeatActive = false,
      onPlayPause,
      onSkipNext,
      onSkipPrevious,
      onToggleShuffle,
      onToggleRepeat,
      onSeek,
      onVolumeChange,
      showVolumeControl = true,
      ...props
    },
    ref,
  ) => {
    const playerRef = React.useRef<HTMLDivElement>(null)
    // Use a type assertion to satisfy the useHover hook's type requirements
    const isHovering = useHover(playerRef as React.RefObject<HTMLElement>)
    const [controlsVisible, setControlsVisible] = React.useState(true)
    const [isInteracting, setIsInteracting] = React.useState(false)

    // Track user interaction with the player (for mobile)
    const handleInteractionStart = () => {
      setIsInteracting(true)
      setControlsVisible(true)
    }

    const handleInteractionEnd = () => {
      setIsInteracting(false)
    }

    // Show controls on hover, touch, or when not playing
    React.useEffect(() => {
      if (isHovering || isInteracting) {
        setControlsVisible(true)
      } else if (!isPlaying) {
        // Keep controls visible if not playing
        setControlsVisible(true)
      } else {
        // Hide controls after a delay when not interacting and playing
        const timer = setTimeout(() => {
          setControlsVisible(false)
        }, 2000)
        return () => clearTimeout(timer)
      }
    }, [isHovering, isInteracting, isPlaying])

    return (
      <div
        className={cn(playerViewVariants({ variant, imageRatio, className }))}
        ref={(node) => {
          // Assign the ref to both our local ref and the forwarded ref
          playerRef.current = node
          if (typeof ref === 'function') {
            ref(node)
          } else if (ref) {
            ref.current = node
          }
        }}
        onTouchStart={handleInteractionStart}
        onTouchEnd={handleInteractionEnd}
        {...props}
      >
        <motion.div className="relative flex-1 overflow-hidden" whileTap={{ scale: 0.98 }}>
          <AspectRatio ratio={imageRatio === 'square' ? 1 : aspectRatio}>
            <motion.img
              src={image}
              alt={`${title} by ${artist}`}
              className="h-full w-full object-cover"
              initial={{ scale: 1 }}
              animate={{
                scale: isPlaying ? 1.05 : 1,
                transition: { duration: 0.7, ease: 'easeInOut' },
              }}
              whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
            />
          </AspectRatio>
        </motion.div>

        <AnimatePresence>
          {controlsVisible && (
            <motion.div
              className="sticky bottom-0 w-full bg-card/80 backdrop-blur-md p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <Player
                title={title}
                artist={artist}
                albumArt={albumArt}
                isPlaying={isPlaying}
                currentTime={currentTime}
                duration={duration}
                progress={progress}
                volume={volume}
                shuffleActive={shuffleActive}
                repeatActive={repeatActive}
                onPlayPause={onPlayPause}
                onSkipNext={onSkipNext}
                onSkipPrevious={onSkipPrevious}
                onToggleShuffle={onToggleShuffle}
                onToggleRepeat={onToggleRepeat}
                onSeek={onSeek}
                onVolumeChange={onVolumeChange}
                showVolumeControl={showVolumeControl}
                variant="default"
                className="border-none shadow-none p-0"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  },
)
PlayerView.displayName = 'PlayerView'

export { PlayerView }
