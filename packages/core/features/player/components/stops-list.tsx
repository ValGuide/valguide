import { useTranslations } from '@valguide/core/i18n/client'
import { useCurrentStopNanoId, useIsPlaying, usePlayerActions, useStops } from '../store/use-player-store'
import { StopSearchBar } from './stop-search-bar'
import { StopsListItem } from './stops-list-item'

type StopsListProps = {
  className?: string
  showSearchBar?: boolean
  onQrScanRequest?: () => void
  onStopSelect?: (nanoId: string) => void
}

export function StopsList({ className = '', showSearchBar = true, onQrScanRequest }: StopsListProps) {
  const t = useTranslations('player')
  const stops = useStops()
  const currentStopNanoId = useCurrentStopNanoId()
  const isPlaying = useIsPlaying()
  const { setCurrentStop } = usePlayerActions()

  if (stops.length === 0) {
    return null
  }

  const totalDuration = stops.reduce((acc, stop) => acc + (stop.duration ?? 0), 0)
  const totalMinutes = Math.ceil(totalDuration / 60)

  return (
    <div className={`space-y-4 ${className}`}>
      {showSearchBar && <StopSearchBar onQrScanRequest={onQrScanRequest} showQrButton={!!onQrScanRequest} />}

      <div className="text-sm text-muted-foreground">
        {t('stopsCount', { count: stops.length })} · {t('totalDuration', { minutes: totalMinutes })}
      </div>

      <div className="space-y-1">
        {stops.map((stop, index) => (
          <StopsListItem
            key={stop.nanoId}
            stop={stop}
            index={index}
            isPlaying={isPlaying && currentStopNanoId === stop.nanoId}
            isCurrent={currentStopNanoId === stop.nanoId}
            onSelect={setCurrentStop}
          />
        ))}
      </div>
    </div>
  )
}
