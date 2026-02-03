import { useTranslations } from '@valguide/core/i18n/client'
import { Input } from '@valguide/core/ui/components/input'
import { ScanLine, Search } from 'lucide-react'
import { useCallback, useState } from 'react'
import { usePlayerActions, useStops } from '../store/use-player-store'

type StopSearchBarProps = {
  className?: string
  onQrScanRequest?: () => void
  showQrButton?: boolean
}

export function StopSearchBar({ className = '', onQrScanRequest, showQrButton = true }: StopSearchBarProps) {
  const t = useTranslations('player')
  const [code, setCode] = useState('')
  const stops = useStops()
  const { setCurrentStop } = usePlayerActions()

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (!code.trim()) return

      // Find stop by code (stopNumber matches 1-indexed position)
      const stopNumber = Number.parseInt(code.trim(), 10)
      if (!Number.isNaN(stopNumber) && stopNumber >= 1 && stopNumber <= stops.length) {
        const stop = stops[stopNumber - 1]
        setCurrentStop(stop.nanoId)
        setCode('')
      }
    },
    [code, stops, setCurrentStop],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handleSubmit(e)
      }
    },
    [handleSubmit],
  )

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="tel"
        inputMode="numeric"
        pattern="[0-9]*"
        placeholder={t('enterStopCode')}
        value={code}
        onChange={(e) => setCode(e.target.value)}
        onKeyDown={handleKeyDown}
        className="pl-9 pr-10"
        aria-label={t('enterStopCode')}
      />
      {showQrButton && onQrScanRequest && (
        <button
          type="button"
          onClick={onQrScanRequest}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-muted transition-colors"
          aria-label={t('scanQrCode')}
        >
          <ScanLine className="h-4 w-4 text-muted-foreground" />
        </button>
      )}
    </form>
  )
}
