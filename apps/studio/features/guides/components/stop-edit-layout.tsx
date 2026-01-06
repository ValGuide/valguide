
import type { Asset } from '@valguide/core/features/assets/schema'
import { PublishStopTranslationButton } from '@valguide/core/features/guides/components/publish-stop-translation-button'
import { VersionHistoryDialogStop } from '@valguide/core/features/guides/components/version-history-dialog-stop'
import type { AssetWithRole, StopWithAssets } from '@valguide/core/features/guides/queries'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@valguide/ui/components/breadcrumb'
import { Button } from '@valguide/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@valguide/ui/components/card'
import { ArrowLeft, Globe } from 'lucide-react'
import { useTranslations } from '@valguide/core/i18n/mock'
import { type ReactNode, useCallback, useRef } from 'react'
import { MediaPicker } from '@/features/assets/components/media-picker/media-picker'
import { getLocaleDisplayName, LocaleSelector } from '@/features/guides/components/locale-selector'
import { StopLocaleEditor, type StopLocaleEditorRef } from '@/features/guides/components/stop-locale-editor'
import { useAutoSave } from '@/features/guides/hooks/use-auto-save'
import { useUnsavedChangesGuard } from '@/features/guides/hooks/use-unsaved-changes-guard'
import type { StopTranslationFormData } from '@/features/guides/schemas/guide-form'
import { getStopLocaleStatusMap } from '@/features/guides/utils/translation-status'

export interface StopEditLayoutProps {
  stop: StopWithAssets
  activeLocale: string
  isDirty: boolean
  isSaving: boolean
  organizationId: string
  stopTitle: string
  locales?: string[]
  onLocaleChange: (locale: string) => void
  onStopChange: (data: StopTranslationFormData) => void
  onDirtyChange: (dirty: boolean) => void
  onSave: () => Promise<void>
  onRefetch: () => void
  onBack: () => void
  backLabel: string
  onImageChange: (assets: Asset[]) => Promise<void>
  onAudioChange: (asset: Asset | null) => Promise<void>
  breadcrumbContent: ReactNode
  stopEditorRef?: React.RefObject<StopLocaleEditorRef | null>
}

export function StopEditLayout({
  stop,
  activeLocale,
  isDirty,
  isSaving,
  organizationId,
  stopTitle,
  locales,
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
  const tStops = useTranslations('stops')
  const internalRef = useRef<StopLocaleEditorRef>(null)
  const stopEditorRef = externalRef ?? internalRef

  const { confirmIfDirty, dialog: unsavedChangesDialog } = useUnsavedChangesGuard({ isDirty })

  const currentStopTranslation = stop.translations.find((tr) => tr.locale === activeLocale)
  const localeStatusMap = getStopLocaleStatusMap(stop)

  const stopImages = stop.assets.filter((a) => (a.role === 'image' || a.role === 'video') && a.locale === null)
  const stopAudio = stop.assets.find((a) => a.role === 'audio' && a.locale === activeLocale) ?? null

  useAutoSave(onSave, isDirty)

  const handleBack = useCallback(() => {
    confirmIfDirty(onBack)
  }, [confirmIfDirty, onBack])

  const handleImagesChange = useCallback(
    async (value: Asset | Asset[] | null) => {
      if (Array.isArray(value)) {
        await onImageChange(value)
      } else if (value === null) {
        await onImageChange([])
      }
    },
    [onImageChange],
  )

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
                </div>

                {/* Locale-specific Content Section */}
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-lg font-semibold">{tStops('editor.localeContent')}</h2>
                  <LocaleSelector
                    value={activeLocale}
                    locales={locales ?? ['en', 'de', 'rm']}
                    onValueChange={onLocaleChange}
                    localeStatus={localeStatusMap}
                  />
                </div>

                <StopLocaleEditor
                  ref={stopEditorRef}
                  key={`${stop.id}-${activeLocale}`}
                  stop={stop}
                  locale={activeLocale}
                  organizationId={organizationId}
                  audio={stopAudio}
                  onChange={onStopChange}
                  onDirtyChange={onDirtyChange}
                  onSave={onSave}
                  onAudioChange={onAudioChange}
                />

                {/* Shared Content Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      {tStops('editor.sharedContent')}
                    </CardTitle>
                    <CardDescription>{tStops('editor.sharedContentDescription')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <MediaPicker
                      mode="multiple"
                      mediaTypes={['image', 'video']}
                      value={stopImages}
                      onChange={handleImagesChange}
                      label={tStops('editor.galleryLabel')}
                      organizationId={organizationId}
                    />
                  </CardContent>
                </Card>
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
