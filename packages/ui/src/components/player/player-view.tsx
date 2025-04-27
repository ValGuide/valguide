import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@valguide/ui/lib/utils'
import { DataTestIdProps } from '@valguide/ui/lib/types'
import { AspectRatio } from '@valguide/ui/components/aspect-ratio'
import { Player, PlayerProps } from './player'

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

export interface PlayerViewProps extends Omit<PlayerProps, 'layout' | 'variant'>, VariantProps<typeof playerViewVariants> {
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
    return (
      <div className={cn(playerViewVariants({ variant, imageRatio, className }))} ref={ref} {...props}>
        <div className="relative flex-1 overflow-hidden">
          <AspectRatio ratio={imageRatio === 'square' ? 1 : aspectRatio}>
            <img
              src={image}
              alt={`${title} by ${artist}`}
              className="h-full w-full object-cover"
            />
          </AspectRatio>
        </div>
        
        <div className="sticky bottom-0 w-full bg-card/80 backdrop-blur-md p-4">
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
        </div>
      </div>
    )
  },
)
PlayerView.displayName = 'PlayerView'

export { PlayerView }
