import { useTranslations } from '@valguide/core/i18n/client'
import { Button } from '@valguide/ui/components/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type StopSequentialNavProps = {
  prevStop?: { nanoId: string; title: string; position: number }
  nextStop?: { nanoId: string; title: string; position: number }
  onNavigate: (stopNanoId: string) => void
}

export function StopSequentialNav({ prevStop, nextStop, onNavigate }: StopSequentialNavProps) {
  const t = useTranslations('stops')

  if (!prevStop && !nextStop) return null

  return (
    <div className="flex items-center justify-between border-t bg-background px-4 py-3">
      <div className="min-w-0 flex-1">
        {prevStop && (
          <Button variant="ghost" size="sm" className="max-w-full" onClick={() => onNavigate(prevStop.nanoId)}>
            <ChevronLeft className="h-4 w-4 shrink-0" />
            <span className="truncate">{t('navigation.previousStop', { title: prevStop.title })}</span>
          </Button>
        )}
      </div>
      <div className="min-w-0 flex-1 text-right">
        {nextStop && (
          <Button variant="ghost" size="sm" className="ml-auto max-w-full" onClick={() => onNavigate(nextStop.nanoId)}>
            <span className="truncate">{t('navigation.nextStop', { title: nextStop.title })}</span>
            <ChevronRight className="h-4 w-4 shrink-0" />
          </Button>
        )}
      </div>
    </div>
  )
}
