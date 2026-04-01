import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  applyQrOverrideToBranding,
  isQrBrandingOverrideEmpty,
  type QrBrandingOverride,
} from '@valguide/core/features/links/qr/shared'
import { updateTourQrBrandingFn } from '@valguide/core/features/links/qr/update-tour-qr-branding.fn'
import { useTranslations } from '@valguide/core/i18n/client'
import { toast } from '@valguide/core/ui/components/sonner/state'
import { useEffect, useState } from 'react'
import { sanitizeQrOverrideForCurrentUi } from '../branding'
import { qrQueryKeys, tourQrCodeQueryOptions } from '../query-options'
import { getQrBrandingSourceLabel } from '../source-label'
import { QrBrandingActions, QrBrandingFields } from './qr-branding-fields'
import { QrCompactSurface } from './qr-compact-surface'
import { QrSummaryCardSkeleton } from './qr-summary-card-skeleton'

type TourQrPanelConnectedProps = {
  tourNanoId: string
}

export function TourQrPanelConnected({ tourNanoId }: TourQrPanelConnectedProps) {
  const t = useTranslations('studio.qr')
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery(tourQrCodeQueryOptions(tourNanoId))
  const [draftOverride, setDraftOverride] = useState<QrBrandingOverride>({})
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setDraftOverride(data?.override ? sanitizeQrOverrideForCurrentUi(data.override) : {})
  }, [data])

  if (isLoading || !data) {
    return <QrSummaryCardSkeleton />
  }

  const previewBranding = isQrBrandingOverrideEmpty(draftOverride)
    ? data.effectiveBranding
    : applyQrOverrideToBranding(data.inheritedBranding, draftOverride, 'tour')

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const result = await updateTourQrBrandingFn({
        data: { tourNanoId, override: sanitizeQrOverrideForCurrentUi(draftOverride) },
      })
      queryClient.setQueryData(qrQueryKeys.tourCode(tourNanoId), result)
      toast.success(t('brandingSaved'))
    } catch {
      toast.error(t('brandingSaveError'))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <QrCompactSurface
      summaryTitle={t('tourOverviewTitle')}
      summaryDescription={t('tourEditCompactDescription')}
      manageTitle={t('tourEditTitle')}
      manageDescription={t('tourEditDescription')}
      shortUrl={data.shortUrl}
      branding={previewBranding}
      note={t('liveTourNote')}
      footer={
        <QrBrandingActions
          source="tour"
          isSaving={isSaving}
          onSave={() => void handleSave()}
          onReset={() => setDraftOverride({})}
        />
      }
    >
      <QrBrandingFields
        source="tour"
        override={draftOverride}
        fallbackBranding={data.inheritedBranding}
        inheritedSourceLabel={getQrBrandingSourceLabel(data.inheritedBranding.source, (key) => t(key))}
        onChange={setDraftOverride}
      />
    </QrCompactSurface>
  )
}
