import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import {
  applyQrOverrideToBranding,
  isQrBrandingOverrideEmpty,
  type QrBrandingOverride,
} from '@valguide/core/features/links/qr/shared'
import { updateOrgQrBrandingFn } from '@valguide/core/features/links/qr/update-org-qr-branding.fn'
import { useTranslations } from '@valguide/core/i18n/client'
import { toast } from '@valguide/core/ui/components/sonner/state'
import { useEffect, useState } from 'react'
import { sanitizeQrOverrideForCurrentUi } from '../branding'
import { orgQrBrandingQueryOptions, qrQueryKeys } from '../query-options'
import { QrBrandingActions, QrBrandingFields } from './qr-branding-fields'
import { QrPreviewCard } from './qr-preview-card'

export function WorkspaceQrBrandingSection() {
  const t = useTranslations('studio.qr')
  const queryClient = useQueryClient()
  const { data } = useSuspenseQuery(orgQrBrandingQueryOptions())
  const [draftOverride, setDraftOverride] = useState<QrBrandingOverride>({})
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setDraftOverride(data?.override ? sanitizeQrOverrideForCurrentUi(data.override) : {})
  }, [data])

  const previewBranding = isQrBrandingOverrideEmpty(draftOverride)
    ? data.effectiveBranding
    : applyQrOverrideToBranding(data.inheritedBranding, draftOverride, 'organization')

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const result = await updateOrgQrBrandingFn({ data: sanitizeQrOverrideForCurrentUi(draftOverride) })
      queryClient.setQueryData(qrQueryKeys.organizationBranding(), result)
      toast.success(t('brandingSaved'))
    } catch {
      toast.error(t('brandingSaveError'))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <QrPreviewCard
      shortUrl={`${data.linksBaseUrl}/s/preview`}
      branding={previewBranding}
      showHeader={false}
      showDownloads={false}
      showShortUrl={false}
      showActions={false}
      showSourceLabel={false}
      showNote={false}
    >
      <QrBrandingFields
        source="organization"
        override={draftOverride}
        fallbackBranding={data.inheritedBranding}
        inheritedSourceLabel={t('sourceDefault')}
        onChange={setDraftOverride}
      />
      <QrBrandingActions
        source="organization"
        isSaving={isSaving}
        onSave={() => void handleSave()}
        onReset={() => setDraftOverride({})}
      />
    </QrPreviewCard>
  )
}
