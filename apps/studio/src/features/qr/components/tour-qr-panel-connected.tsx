import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  applyQrOverrideToBranding,
  isQrBrandingOverrideEmpty,
  type QrBrandingOverride,
} from '@valguide/core/features/links/qr/shared'
import { updateTourQrBrandingFn } from '@valguide/core/features/links/qr/update-tour-qr-branding.fn'
import { useTranslations } from '@valguide/core/i18n/client'
import { toast } from '@valguide/core/ui/components/sonner/state'
import { Skeleton } from '@valguide/ui/components/skeleton'
import { useEffect, useState } from 'react'
import { qrQueryKeys, tourQrCodeQueryOptions } from '../query-options'
import { getQrBrandingSourceLabel } from '../source-label'
import { QrBrandingFields } from './qr-branding-fields'
import { QrCompactSurface } from './qr-compact-surface'

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
    setDraftOverride(data?.override ?? {})
  }, [data])

  if (isLoading || !data) {
    return <Skeleton className="h-[14rem] w-full rounded-xl" />
  }

  const previewBranding = isQrBrandingOverrideEmpty(draftOverride)
    ? data.effectiveBranding
    : applyQrOverrideToBranding(data.inheritedBranding, draftOverride, 'tour')

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const result = await updateTourQrBrandingFn({ data: { tourNanoId, override: draftOverride } })
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
      analytics={data.analytics}
      sourceLabel={getQrBrandingSourceLabel(previewBranding.source, (key) => t(key))}
      note={t('liveTourNote')}
    >
      <QrBrandingFields
        source="tour"
        override={draftOverride}
        fallbackBranding={data.inheritedBranding}
        inheritedSourceLabel={getQrBrandingSourceLabel(data.inheritedBranding.source, (key) => t(key))}
        isSaving={isSaving}
        onChange={setDraftOverride}
        onSave={() => void handleSave()}
        onReset={() => setDraftOverride({})}
      />
    </QrCompactSurface>
  )
}
