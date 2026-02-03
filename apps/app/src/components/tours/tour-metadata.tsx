import { useTranslations } from '@valguide/core/i18n/client'

type TourMetadataProps = {
  stopCount: number
  createdAt: Date
  locale: string
}

export function TourMetadata({ stopCount, createdAt, locale }: TourMetadataProps) {
  const t = useTranslations('tour')

  const formattedDate = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(createdAt))

  return (
    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
      <div>
        <span className="font-medium">{stopCount}</span> {stopCount === 1 ? t('stop') : t('stops')}
      </div>
      <div className="hidden sm:block">{t('separator')}</div>
      <div>{formattedDate}</div>
    </div>
  )
}
