import { Link } from '@tanstack/react-router'
import { Image } from '@unpic/react'
import { getAssetImageUrl } from '@valguide/core/features/assets/image-url'
import { getLocalizedStopText, type StopWithAssets } from '@valguide/core/features/guides/queries'
import { useTranslations } from '@valguide/core/i18n/client'
import type { SupportedLocale } from '@valguide/core/i18n/i18n.config'

type GuideStopListProps = {
  stops: StopWithAssets[]
  guideNanoId: string
  locale: string
}

export function GuideStopList({ stops, guideNanoId, locale }: GuideStopListProps) {
  const t = useTranslations('guide')

  if (stops.length === 0) return null

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">{t('stops')}</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        {stops.map((stop, index) => {
          const title = getLocalizedStopText(stop, 'title', locale as SupportedLocale)
          const thumbnail = stop.assets.find((a) => a.role === 'thumbnail' || a.type === 'image')

          return (
            <Link
              key={stop.id}
              to="/g/$nanoId/s/$stopNanoId"
              params={{ nanoId: guideNanoId, stopNanoId: stop.nanoId }}
              className="group border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              {thumbnail && (
                <div className="relative aspect-video">
                  <Image
                    src={getAssetImageUrl(thumbnail)}
                    alt={title}
                    layout="fullWidth"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
              )}
              <div className="p-4">
                <div className="text-sm text-muted-foreground mb-1">{t('stopNumber', { number: index + 1 })}</div>
                <h3 className="font-semibold">{title}</h3>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
