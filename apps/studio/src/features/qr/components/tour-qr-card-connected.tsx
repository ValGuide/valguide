import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { useTranslations } from '@valguide/core/i18n/client'
import { Button } from '@valguide/ui/components/button'
import { Settings2 } from 'lucide-react'
import { tourQrCodeQueryOptions } from '../query-options'
import { QrSummaryCard } from './qr-summary-card'
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
    <QrSummaryCard
      title={t('tourOverviewTitle')}
      description={t('tourOverviewCompactDescription')}
      shortUrl={data.shortUrl}
      branding={data.effectiveBranding}
      manageAction={
        <Button size="sm" className="gap-2 sm:ml-auto" asChild>
          <Link to="/tours/$nanoId/edit" params={{ nanoId: tourNanoId }}>
            <Settings2 className="h-4 w-4" />
            {t('manageQr')}
          </Link>
        </Button>
      }
    />
  )
}
