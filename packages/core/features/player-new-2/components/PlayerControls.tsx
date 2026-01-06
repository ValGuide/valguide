'use client'

import { cn } from '@valguide/core/ui/lib/utils'
import { Pause, Play, SkipBack, SkipForward } from 'lucide-react'
import { useTranslations } from '@valguide/core/i18n/mock'

interface PlayerControlsProps {
  isPlaying: boolean
  onPlayPause: () => void
  onSkipPrevious?: () => void
  onSkipNext?: () => void
  onRewind: () => void
  onForward: () => void
  className?: string
}

export function PlayerControls({
  isPlaying,
  onPlayPause,
  onSkipPrevious,
  onSkipNext,
  onRewind,
  onForward,
  className,
}: PlayerControlsProps) {
  const t = useTranslations('player')

  return (
    <div className={cn('flex items-center justify-center gap-4 sm:gap-6 w-full', className)}>
      <button
        type="button"
        onClick={onSkipPrevious}
        className="p-2 text-black hover:text-gray-700 transition-colors"
        aria-label={t('previous')}
      >
        <SkipBack size={24} fill="currentColor" />
      </button>

      <button
        type="button"
        onClick={onRewind}
        className="p-2 text-black hover:text-gray-700 transition-colors"
        aria-label={t('rewind')}
      >
        <Rewind15Icon size={24} />
      </button>

      <button
        type="button"
        onClick={onPlayPause}
        className="flex h-16 w-16 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95"
        style={{ backgroundColor: '#73E233' }}
        aria-label={isPlaying ? t('pause') : t('play')}
      >
        {isPlaying ? (
          <Pause size={28} fill="white" stroke="white" />
        ) : (
          <Play size={28} fill="white" stroke="white" className="ml-1" />
        )}
      </button>

      <button
        type="button"
        onClick={onForward}
        className="p-2 text-black hover:text-gray-700 transition-colors"
        aria-label={t('forward')}
      >
        <Forward15Icon size={24} />
      </button>

      <button
        type="button"
        onClick={onSkipNext}
        className="p-2 text-black hover:text-gray-700 transition-colors"
        aria-label={t('next')}
      >
        <SkipForward size={24} fill="currentColor" />
      </button>
    </div>
  )
}

function Rewind15Icon({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M12 5V1L7 6l5 5V7a6 6 0 1 1-6 6" strokeLinecap="round" strokeLinejoin="round" />
      <text x="10" y="16" fontSize="7" fill="currentColor" stroke="none" fontWeight="bold">
        {'15'}
      </text>
    </svg>
  )
}

function Forward15Icon({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M12 5V1l5 5-5 5V7a6 6 0 1 0 6 6" strokeLinecap="round" strokeLinejoin="round" />
      <text x="8" y="16" fontSize="7" fill="currentColor" stroke="none" fontWeight="bold">
        {'15'}
      </text>
    </svg>
  )
}
