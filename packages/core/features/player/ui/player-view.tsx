import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { motion, AnimatePresence } from 'framer-motion'

import { cn } from '@valguide/ui/lib/utils'
import { DataTestIdProps } from '@valguide/ui/lib/types'
import { AspectRatio } from '@valguide/ui/components/aspect-ratio'
import { Player, PlayerProps } from './player'
import { useHover } from 'usehooks-ts'

const playerViewVariants = cva('relative flex flex-col overflow-hidden', {
  variants: {
    variant: {
      default: 'w-full max-w-3xl mx-auto rounded-lg overflow-y-auto',
      fullscreen: 'w-full h-full absolute inset-0 overflow-y-auto',
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
        className={cn(playerViewVariants({ variant, imageRatio, className }), 'flex flex-col justify-between')}
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
        <motion.div
          className={cn('relative overflow-hidden', variant === 'fullscreen' ? 'flex-1 flex flex-col' : 'flex-1')}
          whileTap={{ scale: 0.98 }}
        >
          {variant === 'fullscreen' ? (
            <div className="relative flex-1 flex items-center justify-center overflow-hidden">
              {imageRatio === 'square' ? (
                <div className="w-full max-w-full max-h-[calc(100vh-72px)] flex items-center justify-center">
                  <div className="aspect-square w-full max-h-full">
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
                  </div>
                </div>
              ) : (
                <div className="w-full max-w-full max-h-[calc(100vh-72px)] flex items-center justify-center">
                  <div className="w-full h-auto" style={{ aspectRatio }}>
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
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className={cn('w-full', imageRatio === 'original' && aspectRatio < 1 ? 'max-h-[600px]' : '')}>
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
            </div>
          )}
        </motion.div>

        <AnimatePresence>
          {controlsVisible && (
            <motion.div
              className={cn('w-full bg-card/80 backdrop-blur-md p-4 sticky bottom-0 left-0 right-0 z-10')}
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
