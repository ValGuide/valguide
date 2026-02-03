import { useTranslations } from '@valguide/core/i18n/client'
import { Button } from '@valguide/core/ui/components/button'
import { X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useCurrentStop, useHasEnded, useHasNext, usePlayerActions, useStops } from '../store/use-player-store'

type AutoPlayCountdownProps = {
  /** Countdown duration in seconds */
  countdownSeconds?: number
  className?: string
}

export function AutoPlayCountdown({ countdownSeconds = 5, className = '' }: AutoPlayCountdownProps) {
  const t = useTranslations('player')
  const [secondsLeft, setSecondsLeft] = useState(countdownSeconds)

  const hasNext = useHasNext()
  const hasEnded = useHasEnded()
  const currentStop = useCurrentStop()
  const stops = useStops()
  const { nextStop, setHasEnded } = usePlayerActions()

  // Find next stop info
  const currentIndex = currentStop ? stops.findIndex((s) => s.nanoId === currentStop.nanoId) : -1
  const nextStopInfo = currentIndex >= 0 && currentIndex < stops.length - 1 ? stops[currentIndex + 1] : null

  const handleCancel = useCallback(() => {
    setHasEnded(false)
  }, [setHasEnded])

  const handlePlayNow = useCallback(() => {
    nextStop()
  }, [nextStop])

  useEffect(() => {
    if (!hasEnded || !hasNext) return

    if (secondsLeft <= 0) {
      nextStop()
      return
    }

    const timer = setTimeout(() => {
      setSecondsLeft((s) => s - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [secondsLeft, hasEnded, hasNext, nextStop])

  // Reset countdown when hasEnded changes to true
  useEffect(() => {
    if (hasEnded) {
      setSecondsLeft(countdownSeconds)
    }
  }, [hasEnded, countdownSeconds])

  if (!hasEnded || !hasNext || !nextStopInfo) {
    return null
  }

  return (
    <div className={`rounded-lg bg-muted p-4 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground">{t('autoPlayNext', { seconds: secondsLeft })}</p>
          <p className="font-medium truncate">{nextStopInfo.title}</p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Button variant="secondary" size="sm" onClick={handlePlayNow}>
            {t('playNow')}
          </Button>
          <Button variant="ghost" size="icon" onClick={handleCancel} aria-label={t('cancelAutoPlay')}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-1 w-full bg-background rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-1000 ease-linear"
          style={{ width: `${((countdownSeconds - secondsLeft) / countdownSeconds) * 100}%` }}
        />
      </div>
    </div>
  )
}
