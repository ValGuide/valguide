import type { StopWithAssets } from '@valguide/core/features/guides/queries'
import { RichTextDisplay } from '@valguide/core/features/guides/components/rich-text-display'
import { getLocalizedStopText } from '@valguide/core/features/guides/schema'
import { useTranslations } from '@valguide/core/i18n/client'
import type { SupportedLocale } from '@valguide/core/i18n/i18n.config'
import { AudioPlayer } from './audio-player'
import { ImageSwiper } from './image-swiper'
import { Transcription } from './transcription'
import { VideoPlayer } from './video-player'

type StopContentProps = {
  stop: StopWithAssets
  locale: string
  stopNumber: number
}

export function StopContent({ stop, locale, stopNumber }: StopContentProps) {
  const t = useTranslations('guide')
  const title = getLocalizedStopText(stop, 'title', locale as SupportedLocale)
  const description = getLocalizedStopText(stop, 'description', locale as SupportedLocale)
  const transcription = getLocalizedStopText(stop, 'transcription', locale as SupportedLocale)

  const audioAsset = stop.assets.find((a) => a.type === 'audio')
  const videoAsset = stop.assets.find((a) => a.type === 'video')
  const imageAssets = stop.assets.filter((a) => a.type === 'image')

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground mb-2">{t('stopNumber', { number: stopNumber })}</p>
        <h1 className="text-2xl sm:text-3xl font-bold">{title}</h1>
      </div>

      {audioAsset?.publicUrl && <AudioPlayer src={audioAsset.publicUrl} />}
      {videoAsset?.publicUrl && <VideoPlayer src={videoAsset.publicUrl} />}
      {imageAssets.length > 0 && <ImageSwiper images={imageAssets} />}

      {description && (
        <div className="prose max-w-none">
          <RichTextDisplay content={description} />
        </div>
      )}

      {transcription && <Transcription content={transcription} />}
    </div>
  )
}
