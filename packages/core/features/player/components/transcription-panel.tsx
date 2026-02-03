import { useTranslations } from '@valguide/core/i18n/client'
import { Button } from '@valguide/core/ui/components/button'
import { ScrollArea } from '@valguide/core/ui/components/scroll-area'
import { ChevronDown, ChevronUp, FileText } from 'lucide-react'
import { useState } from 'react'
import { TEXT_SIZE_CLASSES, useAccessibilitySettings } from '../accessibility/use-accessibility-settings'

type TranscriptionPanelProps = {
  transcript?: string | null
  className?: string
  defaultExpanded?: boolean
}

export function TranscriptionPanel({ transcript, className = '', defaultExpanded = false }: TranscriptionPanelProps) {
  const t = useTranslations('player')
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const { textSize } = useAccessibilitySettings()

  if (!transcript) {
    return null
  }

  const textSizeClass = TEXT_SIZE_CLASSES[textSize]

  return (
    <div className={`border rounded-lg overflow-hidden ${className}`}>
      <Button
        variant="ghost"
        className="w-full flex items-center justify-between p-4 rounded-none"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        aria-controls="transcription-content"
      >
        <span className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span className="font-medium">{t('transcript')}</span>
        </span>
        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </Button>

      {isExpanded && (
        <section id="transcription-content" aria-label={t('transcript')}>
          <ScrollArea className="max-h-64">
            <div className={`p-4 pt-0 ${textSizeClass} leading-relaxed whitespace-pre-wrap`}>{transcript}</div>
          </ScrollArea>
        </section>
      )}
    </div>
  )
}
