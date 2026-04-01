import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  applyQrOverrideToBranding,
  isQrBrandingOverrideEmpty,
  type QrBrandingOverride,
} from '@valguide/core/features/links/qr/shared'
import { updateStopQrBrandingFn } from '@valguide/core/features/links/qr/update-stop-qr-branding.fn'
import { useTranslations } from '@valguide/core/i18n/client'
import { toast } from '@valguide/core/ui/components/sonner/state'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@valguide/ui/components/card'
import { Skeleton } from '@valguide/ui/components/skeleton'
import { useEffect, useState } from 'react'
import { useStopEditor } from '@/features/stops/contexts/stop-editor-types'
import { qrQueryKeys, stopQrCodeQueryOptions } from '../query-options'
import { getQrBrandingSourceLabel } from '../source-label'
import { QrBrandingFields } from './qr-branding-fields'
import { QrCompactSurface } from './qr-compact-surface'

function resolveTourNanoId(input: { routeTourNanoId?: string; fallbackTourNanoId?: string | null }): string | null {
  return input.routeTourNanoId ?? input.fallbackTourNanoId ?? null
}

export function StopQrPanelConnected() {
  const t = useTranslations('studio.qr')
  const queryClient = useQueryClient()
  const { nanoId: stopNanoId, navigation, tourUsage } = useStopEditor()
  const routeTourNanoId = navigation.backParams?.nanoId
  const fallbackTourNanoId = tourUsage?.tourCount === 1 ? (tourUsage.tours[0]?.nanoId ?? null) : null
  const tourNanoId = resolveTourNanoId({ routeTourNanoId, fallbackTourNanoId })
  const { data, isLoading } = useQuery({
    ...stopQrCodeQueryOptions(tourNanoId ?? 'missing-tour', stopNanoId),
    enabled: !!tourNanoId,
  })
  const [draftOverride, setDraftOverride] = useState<QrBrandingOverride>({})
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setDraftOverride(data?.override ?? {})
  }, [data])

  if (!tourNanoId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('stopEditTitle')}</CardTitle>
          <CardDescription>{t('stopNeedsTourDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {tourUsage && tourUsage.tourCount > 1 ? t('stopNeedsSpecificTour') : t('stopNeedsTour')}
          </p>
        </CardContent>
      </Card>
    )
  }

  if (isLoading || !data) {
    return <Skeleton className="h-[14rem] w-full rounded-xl" />
  }

  const previewBranding = isQrBrandingOverrideEmpty(draftOverride)
    ? data.effectiveBranding
    : applyQrOverrideToBranding(data.inheritedBranding, draftOverride, 'stop')

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const result = await updateStopQrBrandingFn({ data: { tourNanoId, stopNanoId, override: draftOverride } })
      queryClient.setQueryData(qrQueryKeys.stopCode(tourNanoId, stopNanoId), result)
      toast.success(t('brandingSaved'))
    } catch {
      toast.error(t('brandingSaveError'))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <QrCompactSurface
      summaryTitle={t('stopEditTitle')}
      summaryDescription={t('stopEditCompactDescription')}
      manageTitle={t('stopEditTitle')}
      manageDescription={t('stopEditDescription')}
      shortUrl={data.shortUrl}
      branding={previewBranding}
      analytics={data.analytics}
      sourceLabel={getQrBrandingSourceLabel(previewBranding.source, (key) => t(key))}
      note={t('liveStopNote')}
    >
      <QrBrandingFields
        source="stop"
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
