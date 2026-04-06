import { useTranslations } from '@valguide/core/i18n/client'
import { Button } from '@valguide/core/ui/components/button'
import { Pause, Play, SkipBack, SkipForward } from 'lucide-react'
import type { CSSProperties, SVGProps } from 'react'
import { useCurrentTime, useHasNext, useHasPrev, useIsPlaying, usePlayerActions } from '../store/use-player-store'

type PlayerControlsProps = {
  className?: string
}

function SkipTenBackIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 28 28" fill="none" aria-hidden="true" {...props}>
      <path d="M14 4.75a9 9 0 1 0 8.23 12.65" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path
        d="M16.2 4.95H22v5.8"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M22 4.95l-5.35 5.35" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <text
        x="12.7"
        y="18.1"
        textAnchor="middle"
        fontSize="8.2"
        fontWeight="800"
        fill="currentColor"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        10
      </text>
    </svg>
  )
}

function SkipTenForwardIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 28 28" fill="none" aria-hidden="true" {...props}>
      <path d="M14 4.75a9 9 0 1 1-8.23 12.65" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M11.8 4.95H6v5.8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 4.95l5.35 5.35" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <text
        x="15.3"
        y="18.1"
        textAnchor="middle"
        fontSize="8.2"
        fontWeight="800"
        fill="currentColor"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        10
      </text>
    </svg>
  )
}

export function PlayerControls({ className = '' }: PlayerControlsProps) {
  const t = useTranslations('player')
  const isPlaying = useIsPlaying()
  const currentTime = useCurrentTime()
  const hasNext = useHasNext()
  const hasPrev = useHasPrev()
  const { togglePlay, nextStop, prevStop, seek } = usePlayerActions()
  const controlButtonStyle = { borderRadius: 'calc(var(--radius) + 0.25rem)' } satisfies CSSProperties
  const transportButtonStyle = { borderRadius: 'calc(var(--radius) + 0.5rem)' } satisfies CSSProperties

  return (
    <fieldset
      className={`flex w-full items-center justify-center gap-2 border-none p-0 lg:w-auto lg:gap-4 ${className}`}
      aria-label={t('playerControls')}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={prevStop}
        disabled={!hasPrev}
        aria-label={t('previous')}
        className="h-14 w-14 p-0 md:h-16 md:w-16 lg:h-11 lg:w-11"
        style={controlButtonStyle}
      >
        <SkipBack className="h-6 w-6" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => seek(currentTime - 10)}
        aria-label={t('skipBackTenSeconds')}
        className="relative h-14 w-14 p-0 md:h-16 md:w-16 lg:h-12 lg:w-12"
        style={controlButtonStyle}
      >
        <SkipTenBackIcon className="h-9 w-9 md:h-10 md:w-10 lg:h-9 lg:w-9" />
      </Button>

      <Button
        variant="default"
        size="icon"
        onClick={togglePlay}
        className="h-16 w-16 p-0 md:h-[4.5rem] md:w-[4.5rem] lg:h-14 lg:w-14"
        style={transportButtonStyle}
        aria-label={isPlaying ? t('pause') : t('play')}
      >
        {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="ml-0.5 h-6 w-6" />}
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => seek(currentTime + 10)}
        aria-label={t('skipForwardTenSeconds')}
        className="relative h-14 w-14 p-0 md:h-16 md:w-16 lg:h-12 lg:w-12"
        style={controlButtonStyle}
      >
        <SkipTenForwardIcon className="h-9 w-9 md:h-10 md:w-10 lg:h-9 lg:w-9" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={nextStop}
        disabled={!hasNext}
        aria-label={t('next')}
        className="h-14 w-14 p-0 md:h-16 md:w-16 lg:h-11 lg:w-11"
        style={controlButtonStyle}
      >
        <SkipForward className="h-6 w-6" />
      </Button>
    </fieldset>
  )
}
