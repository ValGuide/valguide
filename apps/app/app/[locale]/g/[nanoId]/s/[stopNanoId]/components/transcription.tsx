'use client'

import { Button } from '@valguide/core/ui/components/button'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useTranslations } from '@valguide/core/i18n/mock'
import { useState } from 'react'

type TranscriptionProps = {
  content: string
}

export function Transcription({ content }: TranscriptionProps) {
  const t = useTranslations('guide')
  const [isExpanded, setIsExpanded] = useState(false)

  if (!content) return null

  return (
    <div className="border rounded-lg overflow-hidden">
      <Button variant="ghost" className="w-full justify-between p-4" onClick={() => setIsExpanded(!isExpanded)}>
        <span className="font-semibold">{t('transcription')}</span>
        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </Button>

      {isExpanded && (
        <div className="px-4 pb-4 pt-2">
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{content}</p>
        </div>
      )}
    </div>
  )
}
