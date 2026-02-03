import { useMediaSession } from '../hooks/use-media-session'
import { usePositionPersistence } from '../hooks/use-position-persistence'
import { useSyncAudioToStore } from '../hooks/use-sync-audio-to-store'
import { AutoPlayCountdown } from './auto-play-countdown'
import { CoverImage } from './cover-image'
import { PlayerControls } from './player-controls'
import { ProgressBar } from './progress-bar'
import { SpeedSelector } from './speed-selector'
import { StopInfo } from './stop-info'

type FullPlayerProps = {
  className?: string
}

export function FullPlayer({ className = '' }: FullPlayerProps) {
  const { currentStop } = useSyncAudioToStore()
  useMediaSession()
  usePositionPersistence()

  if (!currentStop) {
    return null
  }

  return (
    <div className={`flex flex-col items-center space-y-6 ${className}`}>
      {/* Cover Image */}
      <CoverImage src={currentStop.coverImageUrl} alt={currentStop.title} className="w-full max-w-sm" />

      {/* Stop Info */}
      <StopInfo />

      {/* Progress Bar */}
      <ProgressBar className="w-full" />

      {/* Controls */}
      <PlayerControls />

      {/* Speed Selector */}
      <div className="flex items-center gap-4">
        <SpeedSelector />
      </div>

      {/* Auto-play countdown (shows when track ends) */}
      <AutoPlayCountdown className="w-full" />
    </div>
  )
}
