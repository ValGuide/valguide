
import type { Asset } from '@valguide/core/features/assets/schema'
import { PublishTranslationButton } from '@valguide/core/features/guides/components/publish-translation-button'
import { VersionHistoryDialog } from '@valguide/core/features/guides/components/version-history-dialog'
import type { StopWithTranslations } from '@valguide/core/features/guides/schema'
import { useRouter } from '@valguide/i18n/routing'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@valguide/ui/components/breadcrumb'
import { Button } from '@valguide/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@valguide/ui/components/card'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@valguide/ui/components/sheet'
import { Eye, Globe, ListChecks } from 'lucide-react'
import { useTranslations } from '@valguide/core/i18n/mock'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { MediaPicker } from '@/features/assets/components/media-picker/media-picker'
import { GuideMetadataForm, type GuideMetadataFormRef } from '@/features/guides/components/guide-metadata-form'
import { GuideProgress } from '@/features/guides/components/guide-progress'
import { StopsList } from '@/features/guides/components/stops-list'
import { getLocaleDisplayName, UnifiedLocaleSelector } from '@/features/guides/components/unified-locale-selector'
import { useGuideEditor } from '@/features/guides/contexts/guide-editor-context'
import { useAutoSave } from '@/features/guides/hooks/use-auto-save'
import { useLocaleUrl } from '@/features/guides/hooks/use-locale-url'
import { useUnsavedChangesGuard } from '@/features/guides/hooks/use-unsaved-changes-guard'
import { getGuideLocaleStatusMap } from '@/features/guides/utils/translation-status'

interface GuideEditViewProps {
  organizationId?: string
}

export function GuideEditView({ organizationId: organizationIdProp }: GuideEditViewProps) {
  const router = useRouter()
  const t = useTranslations('guides')
  const tStops = useTranslations('stops')
  const tCommon = useTranslations('common')
  const {
    guide,
    activeLocale,
    isDirty,
    isSaving,
    updateGuideTranslationData,
    attachAssetToGuide,
    detachAssetFromGuide,
    addStop,
    deleteStop,
    reorderStops,
    setActiveLocale,
    updateGuideAvailableLocales,
    save,
    refetch,
    registerFormDirty,
    unregisterForm,
    registerFormReset,
  } = useGuideEditor()

  const { confirmIfDirty, dialog: unsavedChangesDialog } = useUnsavedChangesGuard({ isDirty })
  const { buildUrl } = useLocaleUrl(activeLocale)

  const guideDetailUrl = `/guides/${guide.nanoId}`

  const guideTitle =
    guide.translations.find((t) => t.currentVersion?.title)?.currentVersion?.title ??
    guide.translations.find((t) => t.draftVersion?.title)?.draftVersion?.title ??
    t('untitledGuide')

  const organizationId = organizationIdProp ?? ''

  useAutoSave(save, isDirty)

  const currentTranslation = guide.translations.find((t) => t.locale === activeLocale)
  const localeStatusMap = getGuideLocaleStatusMap(guide, guide.availableLocales)

  const hasContentForLocale = useCallback(
    (locale: string) => {
      const translation = guide.translations.find((t) => t.locale === locale)
      return !!(translation?.currentVersionId || translation?.draftVersionId)
    },
    [guide.translations],
  )

  const formRef = useRef<GuideMetadataFormRef>(null)
  const formId = `guide-translation-${activeLocale}`

  const handleDirtyChange = useCallback(
    (formIsDirty: boolean) => {
      registerFormDirty(formId, formIsDirty)
    },
    [formId, registerFormDirty],
  )

  useEffect(() => {
    registerFormReset(
      formId,
      () => {
        formRef.current?.resetToCurrentValues()
      },
      () => {
        formRef.current?.resetToFormValues()
      },
    )
    return () => {
      unregisterForm(formId)
    }
  }, [formId, registerFormReset, unregisterForm])

  const handleSelectStop = (stop: StopWithTranslations | null) => {
    if (stop) {
      router.push(buildUrl(`/guides/${guide.nanoId}/stops/${stop.id}/edit`))
    }
  }

  const handleNavigateToGuides = () => {
    confirmIfDirty(() => router.push('/'))
  }

  const handleNavigateToGuideDetail = () => {
    confirmIfDirty(() => router.push(guideDetailUrl))
  }

  const handleReorderStops = (updates: Array<{ id: string; order: number }>) => {
    const reordered = [...guide.stops]
    updates.forEach(({ id, order }) => {
      const stopToUpdate = reordered.find((s) => s.id === id)
      if (stopToUpdate) stopToUpdate.order = order
    })
    reorderStops(reordered.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)))
  }

  const coverAsset = useMemo(() => {
    return guide.assets.find((a) => a.role === 'cover') ?? null
  }, [guide.assets])

  const handleCoverImageChange = useCallback(
    async (value: Asset | Asset[] | null) => {
      if (value === null) {
        if (coverAsset?.guideAssetId) {
          await detachAssetFromGuide(coverAsset.id, coverAsset.guideAssetId)
        }
      } else if (!Array.isArray(value)) {
        if (coverAsset?.guideAssetId) {
          await detachAssetFromGuide(coverAsset.id, coverAsset.guideAssetId)
        }
        await attachAssetToGuide(value, 'cover')
      }
    },
    [coverAsset, attachAssetToGuide, detachAssetFromGuide],
  )

  return (
    <>
      {unsavedChangesDialog}
      <div className="flex h-[calc(100vh-4rem)] flex-col overflow-x-hidden bg-background">
        {/* Header */}
        <div className="border-b bg-background px-3 py-3 sm:px-6">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <Breadcrumb className="hidden min-w-0 flex-1 overflow-x-auto lg:flex">
              <BreadcrumbList className="flex-nowrap">
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <button type="button" onClick={handleNavigateToGuides}>
                      {t('title')}
                    </button>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild className="block max-w-[180px] truncate">
                    <button type="button" onClick={handleNavigateToGuideDetail}>
                      {guideTitle}
                    </button>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{t('editor.edit')}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
              <UnifiedLocaleSelector
                value={activeLocale}
                locales={guide.availableLocales ?? ['en', 'de', 'rm']}
                onValueChange={setActiveLocale}
                localeStatus={localeStatusMap}
                onAddLocale={async (locale) => {
                  await updateGuideAvailableLocales([...(guide.availableLocales ?? []), locale])
                }}
                onRemoveLocale={async (locale) => {
                  await updateGuideAvailableLocales((guide.availableLocales ?? []).filter((l) => l !== locale))
                }}
                hasContentForLocale={hasContentForLocale}
              />
              <VersionHistoryDialog
                guideId={guide.id}
                locale={activeLocale}
                localeName={getLocaleDisplayName(activeLocale)}
                onRollback={() => {
                  refetch()
                }}
              />
              <PublishTranslationButton
                guideId={guide.id}
                locale={activeLocale}
                localeName={getLocaleDisplayName(activeLocale)}
                hasDraft={!!currentTranslation?.draftVersionId}
                onPublished={() => {
                  refetch()
                }}
              />
              <Button variant="ghost" size="icon" className="h-8 w-8 lg:hidden">
                <span className="sr-only">{t('editor.preview')}</span>
                <Eye className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="hidden lg:flex">
                {t('editor.preview')}
              </Button>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="h-8 w-8 lg:hidden">
                    <ListChecks className="h-4 w-4" />
                    <span className="sr-only">{t('editor.progress')}</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] p-6 sm:w-[350px]">
                  <SheetHeader>
                    <SheetTitle>{t('editor.guideProgress')}</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <GuideProgress guide={guide} locale={activeLocale} />
                  </div>
                </SheetContent>
              </Sheet>
              <Button onClick={save} disabled={isSaving || !isDirty} size="sm" className="px-2 sm:px-3">
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
                {/* Locale-specific Content Section */}
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-lg font-semibold">
                    {t('editor.localeContent')} ({getLocaleDisplayName(activeLocale)})
                  </h2>
                </div>

                <GuideMetadataForm
                  ref={formRef}
                  key={`guide-metadata-${activeLocale}`}
                  locale={activeLocale}
                  translation={currentTranslation}
                  organizationId={organizationId}
                  onTranslationChange={(data) => {
                    updateGuideTranslationData(activeLocale, data)
                  }}
                  onDirtyChange={handleDirtyChange}
                  onSave={save}
                />

                {/* Shared Content Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      {t('editor.sharedContent')}
                    </CardTitle>
                    <CardDescription>{t('editor.sharedContentDescription')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <MediaPicker
                      mode="single"
                      mediaTypes={['image']}
                      value={coverAsset}
                      onChange={handleCoverImageChange}
                      label={t('editor.coverImageLabel')}
                      organizationId={organizationId}
                    />
                  </CardContent>
                </Card>

                {/* Stops Section */}
                <div>
                  <h3 className="mb-4 text-base font-medium">{tStops('title')}</h3>
                  <StopsList
                    stops={guide.stops}
                    locale={activeLocale}
                    selectedStopId={undefined}
                    onReorder={handleReorderStops}
                    onEdit={handleSelectStop}
                    onDelete={deleteStop}
                    onAdd={async () => {
                      const newStop = await addStop()
                      if (newStop) {
                        router.push(buildUrl(`/guides/${guide.nanoId}/stops/${newStop.id}/edit`))
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="hidden w-80 shrink-0 border-l bg-background p-6 lg:block">
            <h3 className="mb-4 text-base font-semibold">{t('editor.guideProgress')}</h3>
            <GuideProgress guide={guide} locale={activeLocale} />
          </div>
        </div>
      </div>
    </>
  )
}
