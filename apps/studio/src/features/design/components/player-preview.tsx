import { CoverImage } from '@valguide/core/features/player/components/cover-image'
import { PlayerControls } from '@valguide/core/features/player/components/player-controls'
import { ProgressBar } from '@valguide/core/features/player/components/progress-bar'
import { SpeedSelector } from '@valguide/core/features/player/components/speed-selector'
import { StopInfo } from '@valguide/core/features/player/components/stop-info'
import { StopsList } from '@valguide/core/features/player/components/stops-list'
import { PlayerProvider } from '@valguide/core/features/player/store/player-provider'
import { useCurrentStop, usePlayerActions } from '@valguide/core/features/player/store/use-player-store'
import type { PlayerStop } from '@valguide/core/features/player/types'
import { useTranslations } from '@valguide/core/i18n/client'
import { Button } from '@valguide/ui/components/button'
import { cn } from '@valguide/ui/lib/utils'
import { ChevronLeft, ListMusic } from 'lucide-react'
import type { CSSProperties } from 'react'
import { useEffect, useMemo } from 'react'

export interface PlayerPreviewProps {
  style?: CSSProperties
  className?: string
  variant?: 'default' | 'storyboard'
}

const previewStops: PlayerStop[] = [
  {
    nanoId: 'stop-1',
    title: 'Historischer Marktplatz',
    audioUrl: null,
    coverImageUrl: null,
    duration: 242,
  },
  {
    nanoId: 'stop-2',
    title: 'Rathaus Arkaden',
    audioUrl: null,
    coverImageUrl: null,
    duration: 198,
  },
  {
    nanoId: 'stop-3',
    title: 'Museumshof',
    audioUrl: null,
    coverImageUrl: null,
    duration: 221,
  },
]

function PreviewSeedState() {
  const currentStop = useCurrentStop()
  const { pause, setHasEnded, setAutoPlayEnabled, syncPlayback } = usePlayerActions()

  useEffect(() => {
    if (!currentStop) {
      return
    }

    pause()
    setHasEnded(false)
    setAutoPlayEnabled(false)
    syncPlayback(Math.min(84, currentStop.duration ?? 0), currentStop.duration ?? 0)
  }, [currentStop, pause, setAutoPlayEnabled, setHasEnded, syncPlayback])

  return null
}

function PreviewFullPlayer() {
  const currentStop = useCurrentStop()

  if (!currentStop) {
    return null
  }

  return (
    <div className="flex flex-col items-center gap-[clamp(1rem,3vw,1.5rem)]">
      <CoverImage src={currentStop.coverImageUrl} alt={currentStop.title} className="w-full max-w-[min(100%,20rem)]" />
      <StopInfo />
      <ProgressBar className="w-full" />
      <PlayerControls />
      <SpeedSelector />
    </div>
  )
}

function PreviewStartTourCard() {
  const tPlayer = useTranslations('player')
  const tTheme = useTranslations('studio.themeCustomizer')
  const panelStyle = { borderRadius: 'calc(var(--radius) + 0.25rem)' } satisfies CSSProperties

  return (
    <div
      className="flex h-full min-w-0 flex-col gap-4 overflow-hidden border bg-card/95 p-5 shadow-sm"
      style={panelStyle}
    >
      <CoverImage src={null} alt={tTheme('playerPreview.tourTitle')} className="w-full" />
      <div className="space-y-2">
        <div className="space-y-1">
          <p className="text-base font-semibold">{tTheme('playerPreview.tourTitle')}</p>
          <p className="text-sm text-muted-foreground">{tTheme('playerPreview.tourInfo')}</p>
        </div>
        <p className="text-sm text-muted-foreground">{tTheme('playerPreview.stopDescription')}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className="rounded-full border px-2 py-1">{tPlayer('offlineReady')}</span>
        <span className="rounded-full border px-2 py-1">{tPlayer('stopsCount', { count: previewStops.length })}</span>
      </div>
      <Button className="w-full" style={panelStyle}>
        {tPlayer('startTour')}
      </Button>
    </div>
  )
}

function PreviewTrackListCard() {
  const panelStyle = { borderRadius: 'calc(var(--radius) + 0.25rem)' } satisfies CSSProperties

  return (
    <div
      className="flex h-full min-h-0 min-w-0 flex-col gap-4 overflow-hidden border bg-card/95 p-5 shadow-sm"
      style={panelStyle}
    >
      <div className="min-h-0 flex-1">
        <StopsList showSearchBar={false} />
      </div>
    </div>
  )
}

function PreviewDesktopStoryboard() {
  const tTheme = useTranslations('studio.themeCustomizer')

  return (
    <div className="w-max min-w-fit px-[clamp(1rem,2vw,1.5rem)] py-[clamp(1rem,2vw,1.5rem)]">
      <div className="grid grid-cols-[18rem_24rem] items-start gap-4 xl:grid-cols-[19rem_27rem] xl:gap-5">
        <div className="flex w-[18rem] min-w-0 flex-col gap-4 xl:w-[19rem]">
          <PreviewStartTourCard />
          <PreviewTrackListCard />
        </div>
        <div
          className="flex h-full flex-col gap-5 border bg-card/95 p-[clamp(1.25rem,2vw,1.75rem)] shadow-md"
          style={{ borderRadius: 'calc(var(--radius) + 0.375rem)' }}
        >
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{tTheme('playerPreview.tourTitle')}</p>
            <p className="text-sm text-muted-foreground">{tTheme('playerPreview.tourInfo')}</p>
          </div>
          <PreviewFullPlayer />
        </div>
      </div>
    </div>
  )
}

function PreviewSurface() {
  const tPlayer = useTranslations('player')
  const tTheme = useTranslations('studio.themeCustomizer')
  const currentStop = useCurrentStop()
  const headerMeta = useMemo(() => tTheme('playerPreview.tourInfo'), [tTheme])
  const panelStyle = { borderRadius: 'calc(var(--radius) + 0.25rem)' } satisfies CSSProperties

  return (
    <div className="mx-auto bg-background w-full max-w-none space-y-[clamp(1rem,3vw,1.5rem)] px-[clamp(1rem,3vw,1.5rem)] py-[clamp(1.25rem,4vw,2rem)]">
      <div className="inline-flex items-center gap-1 text-sm text-muted-foreground">
        <ChevronLeft className="h-4 w-4" />
        <span>{tTheme('playerPreview.tourTitle')}</span>
      </div>

      <div className="space-y-[clamp(1rem,3vw,1.5rem)]">
        <div className="space-y-1">
          <p className="text-sm font-medium">{tTheme('playerPreview.tourTitle')}</p>
          <p className="text-sm text-muted-foreground">{headerMeta}</p>
        </div>

        <PreviewFullPlayer />

        <Button variant="outline" className="w-full" style={panelStyle}>
          <ListMusic className="mr-2 h-4 w-4" />
          {tPlayer('viewAllStops')}
        </Button>

        <div className="border bg-card p-[clamp(0.75rem,2.5vw,1rem)]" style={panelStyle}>
          <StopsList showSearchBar={false} />
        </div>

        {currentStop ? (
          <p className="text-xs text-muted-foreground">
            {tTheme('playerPreview.stopDescription')} {currentStop.title}
          </p>
        ) : null}
      </div>
    </div>
  )
}

export function PlayerPreview({ style, className, variant = 'default' }: PlayerPreviewProps) {
  const shellStyle = { ...style, borderRadius: 'calc(var(--radius) + 0.375rem)' } satisfies CSSProperties

  return (
    <div className={cn('overflow-hidden text-foreground', className)} style={shellStyle} data-tour-theme>
      <PlayerProvider stops={previewStops} initialStopNanoId={previewStops[0].nanoId}>
        <PreviewSeedState />
        {variant === 'storyboard' ? <PreviewDesktopStoryboard /> : <PreviewSurface />}
      </PlayerProvider>
    </div>
  )
}
