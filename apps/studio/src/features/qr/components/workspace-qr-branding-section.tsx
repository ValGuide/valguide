import { useQuery, useQueryClient } from '@tanstack/react-query'
import { clientEnv } from '@valguide/core/env/client'
import { getDefaultLinksBaseUrl } from '@valguide/core/features/links/public-url'
import {
  applyQrOverrideToBranding,
  isQrBrandingOverrideEmpty,
  type QrBrandingOverride,
} from '@valguide/core/features/links/qr/shared'
import { updateOrgQrBrandingFn } from '@valguide/core/features/links/qr/update-org-qr-branding.fn'
import { useTranslations } from '@valguide/core/i18n/client'
import { toast } from '@valguide/core/ui/components/sonner/state'
import { Skeleton } from '@valguide/ui/components/skeleton'
import { useEffect, useState } from 'react'
import { orgQrBrandingQueryOptions, qrQueryKeys } from '../query-options'
import { getQrBrandingSourceLabel } from '../source-label'
import { QrBrandingActions, QrBrandingFields } from './qr-branding-fields'
import { QrPreviewCard } from './qr-preview-card'

export function WorkspaceQrBrandingSection() {
  const t = useTranslations('studio.qr')
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery(orgQrBrandingQueryOptions())
  const [draftOverride, setDraftOverride] = useState<QrBrandingOverride>({})
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setDraftOverride(data?.override ?? {})
  }, [data])

  if (isLoading || !data) {
    return <Skeleton className="h-[28rem] w-full rounded-xl" />
  }

  const previewBranding = isQrBrandingOverrideEmpty(draftOverride)
    ? data.effectiveBranding
    : applyQrOverrideToBranding(data.inheritedBranding, draftOverride, 'organization')
  const sourceLabel = getQrBrandingSourceLabel(previewBranding.source, (key) => t(key))

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const result = await updateOrgQrBrandingFn({ data: draftOverride })
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
      title={t('workspaceTitle')}
      description={t('workspaceDescription')}
      shortUrl={`${getDefaultLinksBaseUrl(clientEnv.VITE_ENV)}/s/preview`}
      branding={previewBranding}
      sourceLabel={sourceLabel}
      note={t('workspaceNote')}
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
