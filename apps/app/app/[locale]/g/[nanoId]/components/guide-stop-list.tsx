import type { StopWithAssets } from '@valguide/core/features/guides/queries'
import { getLocalizedStopText } from '@valguide/core/features/guides/schema'
import type { SupportedLocale } from '@valguide/core/i18n/i18n.config'
import { Link } from '@valguide/i18n/routing'
import Image from 'next/image'
import { useTranslations } from '@valguide/core/i18n/mock'

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
              href={`/${locale}/g/${guideNanoId}/s/${stop.nanoId}`}
              className="group border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              {thumbnail?.publicUrl && (
                <div className="relative aspect-[16/9]">
                  <Image
                    src={thumbnail.publicUrl}
                    alt={title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                    sizes="(max-width: 640px) 100vw, (max-width: 896px) 50vw, 400px"
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
