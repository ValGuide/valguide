import { useQuery } from '@tanstack/react-query'
import { useTranslations } from '@valguide/core/i18n/client'
import { tourQrCodeQueryOptions } from '../query-options'
import { QrCompactSurface } from './qr-compact-surface'
import { QrSummaryCardSkeleton } from './qr-summary-card-skeleton'

type TourQrCardConnectedProps = {
  tourNanoId: string
}

export function TourQrCardConnected({ tourNanoId }: TourQrCardConnectedProps) {
  const t = useTranslations('studio.qr')
  const { data, isLoading } = useQuery(tourQrCodeQueryOptions(tourNanoId))

  if (isLoading || !data) {
    return <QrSummaryCardSkeleton />
  }

  return (
    <QrCompactSurface
      summaryTitle={t('tourOverviewTitle')}
      summaryDescription={t('tourOverviewCompactDescription')}
      manageTitle={t('tourOverviewTitle')}
      manageDescription={t('tourOverviewDescription')}
      shortUrl={data.shortUrl}
      branding={data.effectiveBranding}
      note={t('liveTourNote')}
    />
  )
}
