import { useTranslations } from '@valguide/core/i18n/client'
import { Button } from '@valguide/core/ui/components/button'
import { Popover, PopoverContent, PopoverTrigger } from '@valguide/core/ui/components/popover'
import { usePlayerActions, useSpeed } from '../store/use-player-store'
import { useTourThemePortalContainer } from '../theming/tour-theme-provider'
import { PLAYBACK_SPEEDS } from '../types'

type SpeedSelectorProps = {
  className?: string
}

export function SpeedSelector({ className = '' }: SpeedSelectorProps) {
  const t = useTranslations('player')
  const speed = useSpeed()
  const { setSpeed } = usePlayerActions()
  const portalContainer = useTourThemePortalContainer()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className={className} aria-label={t('playbackSpeed')}>
          {speed}
          <span aria-hidden="true">x</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-2"
        align="center"
        container={portalContainer}
        role="listbox"
        aria-label={t('playbackSpeed')}
      >
        <div className="flex flex-col gap-1">
          {PLAYBACK_SPEEDS.map((s) => (
            <Button
              key={s}
              variant={s === speed ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setSpeed(s)}
              className="justify-center"
              role="option"
              aria-selected={s === speed}
            >
              {s}
              <span aria-hidden="true">x</span>
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
