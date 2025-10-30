import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@valguide/ui/lib/utils'
import { DataTestIdProps } from '@valguide/ui/lib/types'
import { TrackInfo } from './track-info'
import { PlayerControls } from './player-controls'
import { ProgressBar } from './progress-bar'
import { VolumeControl } from './volume-control'

const playerVariants = cva('flex flex-col gap-2 rounded-lg border bg-card p-4 shadow-xs', {
  variants: {
    variant: {
      default: 'w-full',
      compact: 'max-w-md',
    },
    layout: {
      default: '',
      inline: 'flex-row items-center gap-4',
    },
  },
  defaultVariants: {
    variant: 'default',
    layout: 'default',
  },
})

export interface PlayerProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof playerVariants> {
  title: string
  artist: string
  albumArt?: string
  isPlaying?: boolean
  currentTime?: string
  duration?: string
  progress?: number
  volume?: number
  shuffleActive?: boolean
  repeatActive?: boolean
  onPlayPause?: () => void
  onSkipNext?: () => void
  onSkipPrevious?: () => void
  onToggleShuffle?: () => void
  onToggleRepeat?: () => void
  onSeek?: (value: number[]) => void
  onVolumeChangeValue?: (value: number) => void
  showVolumeControl?: boolean
}

const Player = ({
  ref,
  className,
  variant,
  layout,
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
  onVolumeChangeValue,
  showVolumeControl = true,
  ...props
}) => {
  const isInline = layout === 'inline'

  return (
    <div className={cn(playerVariants({ variant, layout, className }))} ref={ref} {...props}>
      <div className={cn('flex items-center gap-4', isInline ? 'flex-1' : '')}>
        <TrackInfo title={title} artist={artist} albumArt={albumArt} className={isInline ? 'flex-1' : ''} />

        {isInline && (
          <div className="flex items-center gap-4">
            <PlayerControls
              isPlaying={isPlaying}
              onPlayPause={onPlayPause}
              onSkipNext={onSkipNext}
              onSkipPrevious={onSkipPrevious}
              onToggleShuffle={onToggleShuffle}
              onToggleRepeat={onToggleRepeat}
              shuffleActive={shuffleActive}
              repeatActive={repeatActive}
              variant={variant === 'compact' ? 'compact' : 'default'}
              size={variant === 'compact' ? 'sm' : 'default'}
            />

            {showVolumeControl && (
              <VolumeControl
                value={volume}
                onValueChange={onVolumeChangeValue}
                variant={variant === 'compact' ? 'compact' : 'default'}
              />
            )}
          </div>
        )}
      </div>

      {!isInline && (
        <>
          <ProgressBar
            value={[progress]}
            max={100}
            step={1}
            onValueChange={onSeek}
            currentTime={currentTime}
            duration={duration}
          />

          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center justify-center w-full">
              <PlayerControls
                isPlaying={isPlaying}
                onPlayPause={onPlayPause}
                onSkipNext={onSkipNext}
                onSkipPrevious={onSkipPrevious}
                onToggleShuffle={onToggleShuffle}
                onToggleRepeat={onToggleRepeat}
                shuffleActive={shuffleActive}
                repeatActive={repeatActive}
                variant={variant === 'compact' ? 'compact' : 'default'}
                size={variant === 'compact' ? 'sm' : 'default'}
              />
            </div>

            {showVolumeControl && (
              <VolumeControl
                value={volume}
                onValueChange={onVolumeChangeValue}
                variant={variant === 'compact' ? 'compact' : 'default'}
              />
            )}
          </div>
        </>
      )}
    </div>
  )
}
Player.displayName = 'Player'

export { Player }
