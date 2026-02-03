import { useTranslations } from '@valguide/core/i18n/client'
import { useCurrentStop, useCurrentStopIndex, useStops } from '../store/use-player-store'

type StopInfoProps = {
  className?: string
}

export function StopInfo({ className = '' }: StopInfoProps) {
  const t = useTranslations('player')
  const currentStop = useCurrentStop()
  const currentIndex = useCurrentStopIndex()
  const stops = useStops()

  if (!currentStop) {
    return null
  }

  const stopNumber = currentIndex + 1
  const totalStops = stops.length

  return (
    <div className={`text-center space-y-1 ${className}`}>
      <p className="text-sm text-muted-foreground">{t('stopOf', { current: stopNumber, total: totalStops })}</p>
      <h1 className="text-xl sm:text-2xl font-bold">{currentStop.title}</h1>
    </div>
  )
}
