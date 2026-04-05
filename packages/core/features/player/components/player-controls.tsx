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
      <SkipButton direction="backward" onClick={() => skip(-DEFAULT_SKIP_SECONDS)} label={t('rewind')} />

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

      <SkipButton direction="forward" onClick={() => skip(DEFAULT_SKIP_SECONDS)} label={t('forward')} />
    </fieldset>
  )
}

type SkipButtonProps = {
  direction: 'backward' | 'forward'
  label: string
  onClick: () => void
}

function SkipButton({ direction, label, onClick }: SkipButtonProps) {
  const Icon = direction === 'backward' ? RotateCcw : RotateCw
  const amountLabel = `${direction === 'backward' ? '-' : '+'}${DEFAULT_SKIP_SECONDS}`

  return (
    <Button
      variant="ghost"
      onClick={onClick}
      aria-label={label}
      className="h-12 min-w-14 rounded-full px-2 text-foreground"
    >
      <span className={`flex items-center gap-1 ${direction === 'backward' ? 'flex-row' : 'flex-row-reverse'}`}>
        <Icon className="h-4 w-4 shrink-0" />
        <span className="text-sm font-semibold tabular-nums" aria-hidden="true">
          {amountLabel}
        </span>
      </span>
    </Button>
  )
}
