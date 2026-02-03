import { useTranslations } from '@valguide/core/i18n/client'
import { Button } from '@valguide/core/ui/components/button'
import { Pause, Play, RotateCcw, RotateCw, SkipBack, SkipForward } from 'lucide-react'
import { useHasNext, useHasPrev, useIsPlaying, usePlayerActions } from '../store/use-player-store'
import { DEFAULT_SKIP_SECONDS } from '../types'

type PlayerControlsProps = {
  className?: string
}

export function PlayerControls({ className = '' }: PlayerControlsProps) {
  const t = useTranslations('player')
  const isPlaying = useIsPlaying()
  const hasNext = useHasNext()
  const hasPrev = useHasPrev()
  const { togglePlay, skip, nextStop, prevStop } = usePlayerActions()

  return (
    <fieldset
      className={`flex items-center justify-center gap-2 sm:gap-4 border-none p-0 ${className}`}
      aria-label={t('playerControls')}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={() => skip(-DEFAULT_SKIP_SECONDS)}
        aria-label={t('rewind')}
        className="relative"
      >
        <RotateCcw className="h-5 w-5" />
        <span className="absolute text-[10px] font-medium" aria-hidden="true">
          {DEFAULT_SKIP_SECONDS}
        </span>
      </Button>

      <Button variant="ghost" size="icon" onClick={prevStop} disabled={!hasPrev} aria-label={t('previous')}>
        <SkipBack className="h-5 w-5" />
      </Button>

      <Button
        variant="default"
        size="icon"
        onClick={togglePlay}
        className="h-14 w-14 rounded-full"
        aria-label={isPlaying ? t('pause') : t('play')}
      >
        {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
      </Button>

      <Button variant="ghost" size="icon" onClick={nextStop} disabled={!hasNext} aria-label={t('next')}>
        <SkipForward className="h-5 w-5" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => skip(DEFAULT_SKIP_SECONDS)}
        aria-label={t('forward')}
        className="relative"
      >
        <RotateCw className="h-5 w-5" />
        <span className="absolute text-[10px] font-medium" aria-hidden="true">
          {DEFAULT_SKIP_SECONDS}
        </span>
      </Button>
    </fieldset>
  )
}
