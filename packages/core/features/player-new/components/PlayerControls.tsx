'use client'

import * as React from 'react'
import { Play, Pause, RotateCcw, RotateCw, Volume2, Cast } from 'lucide-react'
import { cn } from '@valguide/core/ui/lib/utils'
import { Button } from '@valguide/core/ui/components/button'
import { useTranslations } from 'next-intl'

interface PlayerControlsProps {
  isPlaying: boolean
  onPlayPause: () => void
  onRewind: () => void
  onForward: () => void
  className?: string
}

export function PlayerControls({
  isPlaying,
  onPlayPause,
  onRewind,
  onForward,
  className,
}: PlayerControlsProps) {
  const t = useTranslations('player')

  return (
    <div className={cn('flex items-center justify-between w-full px-4', className)}>
      {/* Left secondary controls (Volume/Cast placeholder) */}
      <div className="flex items-center gap-4 text-white/70">
        <button className="p-2 hover:text-white transition-colors">
           <Volume2 size={20} />
        </button>
      </div>

      {/* Main Playback Controls */}
      <div className="flex items-center gap-6">
        <button
          onClick={onRewind}
          className="p-2 text-white/90 hover:text-white transition-transform hover:scale-105 active:scale-95"
          aria-label={t('rewind')}
        >
          <RotateCcw size={28} strokeWidth={1.5} />
        </button>

        <button
          onClick={onPlayPause}
          className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-black shadow-xl transition-transform hover:scale-105 active:scale-95"
          aria-label={isPlaying ? t('pause') : t('play')}
        >
          {isPlaying ? (
            <Pause size={32} fill="currentColor" className="ml-0.5" />
          ) : (
            <Play size={32} fill="currentColor" className="ml-1" />
          )}
        </button>

        <button
          onClick={onForward}
          className="p-2 text-white/90 hover:text-white transition-transform hover:scale-105 active:scale-95"
          aria-label={t('forward')}
        >
          <RotateCw size={28} strokeWidth={1.5} />
        </button>
      </div>

      {/* Right secondary controls (Cast/More placeholder) */}
      <div className="flex items-center gap-4 text-white/70">
        <button className="p-2 hover:text-white transition-colors">
          <Cast size={20} />
        </button>
      </div>
    </div>
  )
}
