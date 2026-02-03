import { useTranslations } from '@valguide/core/i18n/client'
import { AlertTriangle, Link as LinkIcon } from 'lucide-react'

type SharedStopBannerProps = {
  tourCount: number
}

export function SharedStopBanner({ tourCount }: SharedStopBannerProps) {
  const t = useTranslations('stops.editor')

  if (tourCount <= 1) return null

  return (
    <div className="flex items-center gap-3 rounded-lg border border-warning/20 bg-warning/5 p-3 text-sm">
      <AlertTriangle className="h-4 w-4 shrink-0 text-warning" />
      <div className="flex flex-1 flex-wrap items-center gap-x-2 gap-y-1">
        <div className="flex items-center gap-2">
          <LinkIcon className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="font-medium">{t('usedInTours', { count: tourCount })}</span>
        </div>
        <span className="text-muted-foreground">{t('sharedStopWarning')}</span>
      </div>
    </div>
  )
}
