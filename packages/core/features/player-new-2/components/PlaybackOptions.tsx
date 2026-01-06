'use client'

import { cn } from '@valguide/core/ui/lib/utils'
import { Languages } from 'lucide-react'
import { useTranslations } from '@valguide/core/i18n/mock'

interface PlaybackOptionsProps {
  playbackSpeed: number
  onSpeedChange?: () => void
  onTranscriptClick?: () => void
  onLanguageClick?: () => void
  className?: string
}

export function PlaybackOptions({
  playbackSpeed,
  onSpeedChange,
  onTranscriptClick,
  onLanguageClick,
  className,
}: PlaybackOptionsProps) {
  const t = useTranslations('player')

  return (
    <div className={cn('flex items-center justify-between w-full', className)}>
      <button
        type="button"
        onClick={onSpeedChange}
        className="text-base font-medium text-black hover:text-gray-700 transition-colors"
        aria-label={t('playbackSpeed')}
      >
        {`${playbackSpeed.toFixed(1)}x`}
      </button>

      <button
        type="button"
        onClick={onTranscriptClick}
        className="px-4 py-1.5 text-sm text-gray-500 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
      >
        {t('transcript')}
      </button>

      <button
        type="button"
        onClick={onLanguageClick}
        className="p-2 text-gray-600 hover:text-black transition-colors"
        aria-label={t('language')}
      >
        <Languages size={22} />
      </button>
    </div>
  )
}
