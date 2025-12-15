'use client'

import type { Asset } from '@valguide/core/features/assets/schema'
import { PublishStopTranslationButton } from '@valguide/core/features/guides/components/publish-stop-translation-button'
import { VersionHistoryDialogStop } from '@valguide/core/features/guides/components/version-history-dialog-stop'
import type { AssetWithRole, StopWithAssets } from '@valguide/core/features/guides/queries'
import type { SupportedLocale } from '@valguide/i18n/i18n.config'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@valguide/ui/components/breadcrumb'
import { Button } from '@valguide/ui/components/button'
import { ArrowLeft } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { type ReactNode, useCallback, useRef } from 'react'
import { getLocaleDisplayName, LocaleSelector } from '@/features/guides/components/locale-selector'
import { StopEditor, type StopEditorRef } from '@/features/guides/components/stop-editor'
import { useAutoSave } from '@/features/guides/hooks/use-auto-save'
import { useUnsavedChangesGuard } from '@/features/guides/hooks/use-unsaved-changes-guard'
import type { StopTranslationFormData } from '@/features/guides/schemas/guide-form'
import { getStopLocaleStatusMap } from '@/features/guides/utils/translation-status'

export interface StopEditLayoutProps {
  stop: StopWithAssets
  activeLocale: SupportedLocale
  isDirty: boolean
  isSaving: boolean
  organizationId: string
  stopTitle: string
  onLocaleChange: (locale: SupportedLocale) => void
  onStopChange: (data: StopTranslationFormData) => void
  onDirtyChange: (dirty: boolean) => void
  onSave: () => Promise<void>
  onRefetch: () => void
  onBack: () => void
  backLabel: string
  onImageChange: (assets: Asset[]) => Promise<void>
  onAudioChange: (asset: Asset | null) => Promise<void>
  breadcrumbContent: ReactNode
  stopEditorRef?: React.RefObject<StopEditorRef | null>
}

export function StopEditLayout({
  stop,
  activeLocale,
  isDirty,
  isSaving,
  organizationId,
  stopTitle,
  onLocaleChange,
  onStopChange,
  onDirtyChange,
  onSave,
  onRefetch,
  onBack,
  backLabel,
  onImageChange,
  onAudioChange,
  breadcrumbContent,
  stopEditorRef: externalRef,
}: StopEditLayoutProps) {
  const t = useTranslations('guides')
  const internalRef = useRef<StopEditorRef>(null)
  const stopEditorRef = externalRef ?? internalRef

  const { confirmIfDirty, dialog: unsavedChangesDialog } = useUnsavedChangesGuard({ isDirty })

  const currentStopTranslation = stop.translations.find((tr) => tr.locale === activeLocale)
  const localeStatusMap = getStopLocaleStatusMap(stop)

  const stopImages = stop.assets.filter(
    (a) => (a.role === 'image' || a.role === 'video') && (a.locale === activeLocale || a.locale === null),
  )
  const stopAudio =
    stop.assets.find((a) => a.role === 'audio' && (a.locale === activeLocale || a.locale === null)) ?? null

  useAutoSave(onSave, isDirty)

  const handleBack = useCallback(() => {
    confirmIfDirty(onBack)
  }, [confirmIfDirty, onBack])

  return (
    <>
      {unsavedChangesDialog}
      <div className="flex h-[calc(100vh-4rem)] flex-col overflow-x-hidden bg-background">
        {/* Header */}
        <div className="border-b bg-background px-3 py-3 sm:px-6">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <Breadcrumb className="hidden min-w-0 flex-1 lg:flex">
              <BreadcrumbList className="flex-nowrap">
                {breadcrumbContent}
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="block max-w-[150px] truncate">{stopTitle}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className="ml-auto flex shrink-0 flex-wrap items-center gap-1 sm:gap-2">
              <VersionHistoryDialogStop
                stopId={stop.id}
                locale={activeLocale}
                localeName={getLocaleDisplayName(activeLocale)}
                onRollback={onRefetch}
              />
              <PublishStopTranslationButton
                stopId={stop.id}
                locale={activeLocale}
                localeName={getLocaleDisplayName(activeLocale)}
                hasDraft={!!currentStopTranslation?.draftVersionId}
                onPublished={onRefetch}
              />
              <Button variant="ghost" size="sm" className="hidden sm:flex">
                {t('editor.preview')}
              </Button>
              <Button onClick={onSave} disabled={isSaving || !isDirty} size="sm">
                {isSaving ? t('editor.saving') : t('editor.save')}
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex min-w-0 flex-1 overflow-hidden">
          <div className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-background">
            <div className="mx-auto w-full max-w-4xl p-4 sm:p-6 lg:p-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <Button variant="ghost" size="sm" onClick={handleBack} className="gap-1 w-fit">
                    <ArrowLeft className="h-4 w-4" />
                    {backLabel}
                  </Button>
                  <LocaleSelector value={activeLocale} onValueChange={onLocaleChange} localeStatus={localeStatusMap} />
                </div>

                <StopEditor
                  ref={stopEditorRef}
                  key={`${stop.id}-${activeLocale}`}
                  stop={stop}
                  locale={activeLocale}
                  organizationId={organizationId}
                  images={stopImages}
                  audio={stopAudio}
                  onChange={onStopChange}
                  onDirtyChange={onDirtyChange}
                  onSave={onSave}
                  onImageChange={async (assets) => {
                    const newAssetIds = new Set(assets.map((a) => a.id))
                    const currentAssetIds = new Set(stopImages.map((a) => a.id))

                    for (const existing of stopImages) {
                      if (!newAssetIds.has(existing.id) && existing.stopAssetId) {
                        await onImageChange(assets)
                        return
                      }
                    }

                    for (const asset of assets) {
                      if (!currentAssetIds.has(asset.id)) {
                        await onImageChange(assets)
                        return
                      }
                    }
                  }}
                  onAudioChange={onAudioChange}
                />
              </div>
            </div>
          </div>

          <div className="hidden w-80 shrink-0 border-l bg-background p-6 lg:block">
            <h3 className="mb-4 text-base font-semibold">{t('editor.stopProgress')}</h3>
            {/* TODO: Add stop-specific progress */}
          </div>
        </div>
      </div>
    </>
  )
}
