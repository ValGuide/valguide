import { useTranslations } from '@valguide/core/i18n/client'

type VideoPlayerProps = {
  src: string
}

export function VideoPlayer({ src }: VideoPlayerProps) {
  const t = useTranslations('tour')

  return (
    <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-black">
      {/* biome-ignore lint/a11y/useMediaCaption: Video content may not have captions available */}
      <video src={src} controls className="w-full h-full" preload="metadata">
        {t('videoNotSupported')}
      </video>
    </div>
  )
}
