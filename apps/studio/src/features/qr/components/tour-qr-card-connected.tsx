import { useQuery } from '@tanstack/react-query'
import { useTranslations } from '@valguide/core/i18n/client'
import { Skeleton } from '@valguide/ui/components/skeleton'
import { tourQrCodeQueryOptions } from '../query-options'
import { getQrBrandingSourceLabel } from '../source-label'
import { QrCompactSurface } from './qr-compact-surface'

type TourQrCardConnectedProps = {
  tourNanoId: string
}

export function TourQrCardConnected({ tourNanoId }: TourQrCardConnectedProps) {
  const t = useTranslations('studio.qr')
  const { data, isLoading } = useQuery(tourQrCodeQueryOptions(tourNanoId))

  if (isLoading || !data) {
    return <Skeleton className="h-[14rem] w-full rounded-xl" />
  }

  return (
    <QrCompactSurface
      summaryTitle={t('tourOverviewTitle')}
      summaryDescription={t('tourOverviewCompactDescription')}
      manageTitle={t('tourOverviewTitle')}
      manageDescription={t('tourOverviewDescription')}
      shortUrl={data.shortUrl}
      branding={data.effectiveBranding}
      analytics={data.analytics}
      sourceLabel={getQrBrandingSourceLabel(data.effectiveBranding.source, (key) => t(key))}
      note={t('liveTourNote')}
    />
  )
}
