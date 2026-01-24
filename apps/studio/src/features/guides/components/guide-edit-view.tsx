import { useRouter } from '@tanstack/react-router'
import type { Asset } from '@valguide/core/features/assets/schema'
import { GuideStatusBadge } from '@valguide/core/features/guides/components/guide-status-badge'
import { getGuideStatusDisplay } from '@valguide/core/features/guides/status-utils'
import { useTranslations } from '@valguide/core/i18n/client'
import { toast } from '@valguide/core/ui/components/sonner/state'
import { defaultLocale } from '@valguide/i18n/i18n.config'
import { Button } from '@valguide/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@valguide/ui/components/card'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@valguide/ui/components/sheet'

import { ChevronLeft, Globe, ListChecks } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { MediaPickerComponent } from '@/features/assets/components/media-picker/types'
import { DraftPublishedTabs, type EditorTab } from '@/features/guides/components/draft-published-tabs'
import { EditorActionsPanel } from '@/features/guides/components/editor-actions-panel'
import { EditorHeader } from '@/features/guides/components/editor-header'
import { GuideMetadataForm, type GuideMetadataFormRef } from '@/features/guides/components/guide-metadata-form'
import { GuideProgress } from '@/features/guides/components/guide-progress'
import { HideStopDialog } from '@/features/guides/components/hide-stop-dialog'
import { getLocaleDisplayName, LocaleSelector } from '@/features/guides/components/locale-selector'
import { MobileMoreMenu, MobileSavePublish } from '@/features/guides/components/mobile-action-bar'
import { ShowStopDialog } from '@/features/guides/components/show-stop-dialog'
import { StopsList } from '@/features/guides/components/stops-list'
import { useGuideEditor } from '@/features/guides/contexts/guide-editor-types'
import { useAutoSave } from '@/features/guides/hooks/use-auto-save'
import { useUnsavedChangesGuard } from '@/features/guides/hooks/use-unsaved-changes-guard'

interface GuideEditViewProps {
  onPublish?: (guideId: string, locale: string) => Promise<{ success: boolean; error?: string }>
  onUnpublish?: (guideId: string, locale: string) => Promise<{ success: boolean; error?: string }>
  onDiscard?: (guideId: string, locale: string) => Promise<{ success: boolean; error?: string }>
  onHideStop?: (guideId: string, stopId: string) => Promise<unknown>
  onShowStop?: (guideId: string, stopId: string) => Promise<unknown>
  MediaPicker: MediaPickerComponent
}

export function GuideEditView({
  onPublish,
  onUnpublish,
  onDiscard,
  onHideStop,
  onShowStop,
  MediaPicker,
}: GuideEditViewProps) {
  const router = useRouter()
  const t = useTranslations('guides')
  const tStops = useTranslations('stops')
  const {
    nanoId,
    guideId,
    metadata,
    localeData,
    activeLocale,
    availableLocales,
    isDirty,
    isSaving,
    lastSaved,
    guideAssets,
    setGuideCover,
    addStop,
    removeStop,
    reorderStops,
    setActiveLocale,
    save,
    refetch,
    registerFormDirty,
    unregisterForm,
    registerFormReset,
  } = useGuideEditor()

  const [activeTab, setActiveTab] = useState<EditorTab>('draft')
  const [isPublishing, setIsPublishing] = useState(false)
  const [stopToHide, setStopToHide] = useState<{ id: string; title: string } | null>(null)
  const [stopToShow, setStopToShow] = useState<{ id: string; title: string } | null>(null)

  const { confirmIfDirty, dialog: unsavedChangesDialog } = useUnsavedChangesGuard({ isDirty })
  const localeSearch = activeLocale !== defaultLocale ? { locale: activeLocale } : undefined

  // Get title from locale data based on active tab
  const guideTitle = useMemo(() => {
    const translation = localeData?.guideTranslation
    let title: string | null | undefined
    if (activeTab === 'published') {
      title = translation?.currentVersion?.title
    } else {
      title = translation?.draftVersion?.title ?? translation?.currentVersion?.title
    }
    return title?.trim() ? title : t('unknownTitle')
  }, [localeData, activeTab, t])

  useAutoSave(save, isDirty)

  // Get status info from locale data
  const hasDraft = !!localeData?.guideTranslation?.draftVersionId
  const hasPublished = !!localeData?.guideTranslation?.currentVersionId

  // Guide-level status with change indicator based on translation state
  const computedStatusDisplay = getGuideStatusDisplay(
    {
      published: metadata?.published ?? null,
      archivedAt: null,
    },
    localeData?.guideTranslation
      ? {
          currentVersionId: localeData.guideTranslation.currentVersionId,
          draftVersionId: localeData.guideTranslation.draftVersionId,
        }
      : null,
  )

  // Store stable status during publishing to prevent flickering
  // Both badge and button update in the same render cycle
  const stableStatusRef = useRef(computedStatusDisplay)
  if (!isPublishing) {
    stableStatusRef.current = computedStatusDisplay
  }
  const statusDisplay = isPublishing ? stableStatusRef.current : computedStatusDisplay

  const isReadOnly = activeTab === 'published'

  const draftVersionData = localeData?.guideTranslation?.draftVersion
    ? {
        title: localeData.guideTranslation.draftVersion.title,
        description: localeData.guideTranslation.draftVersion.description,
      }
    : null

  const publishedVersionData = localeData?.guideTranslation?.currentVersion
    ? {
        title: localeData.guideTranslation.currentVersion.title,
        description: localeData.guideTranslation.currentVersion.description,
      }
    : null

  // For editing: use draft if available, otherwise fall back to published content
  // This ensures users always see the current content when editing
  const editableVersionData = draftVersionData ?? publishedVersionData ?? { title: '', description: '' }

  // Convert null to undefined for component prop types
  const displayVersionData = isReadOnly ? (publishedVersionData ?? undefined) : editableVersionData

  const formRef = useRef<GuideMetadataFormRef>(null)
  const formId = `guide-translation-${activeLocale}`

  const handleDirtyChange = useCallback(
    (formIsDirty: boolean) => {
      registerFormDirty(formId, formIsDirty, () => formRef.current?.getValues() ?? { title: '', description: '' })
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

  const handleSelectStop = (stopId: string) => {
    router.navigate({ to: '/guides/$nanoId/stops/$stopId/edit', params: { nanoId, stopId }, search: localeSearch })
  }

  const handleNavigateToGuide = () => {
    confirmIfDirty(() => router.navigate({ to: '/guides/$nanoId', params: { nanoId } }))
  }

  const handleReorderStops = (updates: Array<{ id: string; order: number }>) => {
    reorderStops(updates)
  }

  const getStopTitle = useCallback(
    (stopId: string) => {
      const stopTranslation = localeData?.stopTranslations.find((st) => st.stopId === stopId)
      return stopTranslation?.draftVersion?.title ?? stopTranslation?.currentVersion?.title ?? tStops('untitled')
    },
    [localeData, tStops],
  )

  const handleHideStop = useCallback(
    (stopId: string) => {
      const title = getStopTitle(stopId)
      setStopToHide({ id: stopId, title })
    },
    [getStopTitle],
  )

  const handleConfirmHide = useCallback(async () => {
    if (!stopToHide || !guideId || !onHideStop) return
    await onHideStop(guideId, stopToHide.id)
    await refetch()
  }, [stopToHide, guideId, onHideStop, refetch])

  const handleShowStop = useCallback(
    (stopId: string) => {
      const title = getStopTitle(stopId)
      setStopToShow({ id: stopId, title })
    },
    [getStopTitle],
  )

  const handleConfirmShow = useCallback(async () => {
    if (!stopToShow || !guideId || !onShowStop) return
    await onShowStop(guideId, stopToShow.id)
    await refetch()
  }, [stopToShow, guideId, onShowStop, refetch])

  const coverAsset = useMemo(() => {
    return guideAssets.find((a) => a.role === 'cover') ?? null
  }, [guideAssets])

  const handleCoverImageChange = useCallback(
    (value: Asset | Asset[] | null) => {
      if (value === null) {
        setGuideCover(null)
      } else if (!Array.isArray(value)) {
        setGuideCover(value)
      }
    },
    [setGuideCover],
  )

  const handlePublish = useCallback(async () => {
    if (!onPublish) return
    setIsPublishing(true)
    try {
      if (isDirty) {
        await save()
      }
      const result = await onPublish(guideId, activeLocale)
      if (result.success) {
        toast.success(t('publish.success'))
        await refetch()
      } else {
        toast.error(result.error ?? t('publish.error'))
      }
    } catch (error) {
      console.error('Failed to publish:', error)
      toast.error(t('publish.error'))
    } finally {
      setIsPublishing(false)
    }
  }, [guideId, activeLocale, refetch, onPublish, isDirty, save, t])

  const handleUnpublish = useCallback(async () => {
    if (!onUnpublish) return
    try {
      const result = await onUnpublish(guideId, activeLocale)
      if (result.success) {
        toast.success('Content unpublished')
        refetch()
      } else {
        toast.error(result.error ?? 'Failed to unpublish')
      }
    } catch (error) {
      console.error('Failed to unpublish:', error)
      toast.error('Failed to unpublish')
    }
  }, [guideId, activeLocale, refetch, onUnpublish])

  const handleDiscard = useCallback(async () => {
    if (!onDiscard) return
    try {
      const result = await onDiscard(guideId, activeLocale)
      if (result.success) {
        toast.success('Draft discarded')
        refetch()
      } else {
        toast.error('Failed to discard draft')
      }
    } catch (error) {
      console.error('Failed to discard:', error)
      toast.error('Failed to discard draft')
    }
  }, [guideId, activeLocale, refetch, onDiscard])

  const handleTabChange = useCallback(
    (tab: EditorTab) => {
      if (tab === 'published' && !hasPublished) return
      if (isDirty && tab === 'published') {
        confirmIfDirty(() => setActiveTab(tab))
      } else {
        setActiveTab(tab)
      }
    },
    [hasPublished, isDirty, confirmIfDirty],
  )

  if (!metadata) {
    return null
  }

  return (
    <>
      {unsavedChangesDialog}
      <div className="bg-background pb-16 sm:pb-0">
        {/* Mobile/Tablet Focus Mode Header */}
        <div className="sticky top-0 z-10 border-b bg-background lg:hidden">
          {/* Row 1: Back button left, actions right */}
          <div className="flex items-center justify-between gap-2 px-4 py-3 sm:px-6 sm:py-4">
            <Button variant="ghost" size="sm" onClick={handleNavigateToGuide} className="-ml-2 shrink-0">
              <ChevronLeft className="h-4 w-4" />
              <span>{t('editor.guideDetails')}</span>
            </Button>

            <div className="flex shrink-0 items-center gap-2">
              <LocaleSelector
                value={activeLocale}
                locales={availableLocales}
                onValueChange={setActiveLocale}
                guideNanoId={nanoId}
              />
              <MobileMoreMenu
                contentType="guide"
                hasDraft={hasDraft}
                hasPublished={hasPublished}
                onUnpublish={handleUnpublish}
                onDiscard={handleDiscard}
              />
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <ListChecks className="h-4 w-4" />
                    <span className="sr-only">{t('editor.guideProgress')}</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-75 p-6 sm:w-87.5">
                  <SheetHeader>
                    <SheetTitle>{t('editor.guideProgress')}</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <GuideProgress />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Row 2: Title + Status Badge */}
          <div className="flex flex-col gap-1 px-4 pb-3 sm:px-6">
            <div className="flex items-center gap-2">
              <h1 className="min-w-0 truncate text-lg font-semibold">{guideTitle}</h1>
              <GuideStatusBadge
                status={statusDisplay.status}
                indicator={statusDisplay.indicator}
                size="sm"
                className="shrink-0"
              />
            </div>
            {statusDisplay.status === 'published' && statusDisplay.indicator === 'changed' && (
              <p className="text-xs text-muted-foreground">{t('helper.changedExplanation')}</p>
            )}
          </div>

          {/* Row 3: Draft/Published tabs */}
          <div className="px-4 pb-3 sm:px-6">
            <DraftPublishedTabs
              activeTab={activeTab}
              onTabChange={handleTabChange}
              hasDraft={hasDraft}
              hasPublished={hasPublished}
            />
          </div>
        </div>

        {/* Desktop Header */}
        <EditorHeader
          backLabel={t('editor.guideDetails')}
          onBack={handleNavigateToGuide}
          className="hidden lg:flex"
          actions={
            <>
              <LocaleSelector
                value={activeLocale}
                locales={availableLocales}
                onValueChange={setActiveLocale}
                guideNanoId={nanoId}
              />
              <Button variant="ghost" size="sm">
                {t('editor.preview')}
              </Button>
            </>
          }
        />

        {/* Desktop: Status Badge and Tabs */}
        <div className="sticky top-14 z-10 hidden border-b bg-background px-4 py-3 sm:px-6 lg:block">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 sm:gap-3">
                <h1 className="min-w-0 truncate text-lg font-semibold sm:text-xl">{guideTitle}</h1>
                <GuideStatusBadge
                  status={statusDisplay.status}
                  indicator={statusDisplay.indicator}
                  size="lg"
                  className="shrink-0"
                />
              </div>
              {statusDisplay.status === 'published' && statusDisplay.indicator === 'changed' && (
                <p className="text-sm text-muted-foreground">{t('helper.changedExplanation')}</p>
              )}
            </div>
            <DraftPublishedTabs
              activeTab={activeTab}
              onTabChange={handleTabChange}
              hasDraft={hasDraft}
              hasPublished={hasPublished}
            />
          </div>
        </div>

        {/* Mobile Save/Publish - fixed bottom bar */}
        <div className="lg:hidden">
          <MobileSavePublish
            hasDraft={hasDraft}
            isDirty={isDirty}
            isSaving={isSaving}
            isPublishing={isPublishing}
            onSave={save}
            onPublish={handlePublish}
            disabled={isReadOnly}
          />
        </div>

        {/* Main Content */}
        <div className="flex min-w-0">
          <div className="min-w-0 flex-1 bg-muted/30 dark:bg-background">
            <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
              <div className="space-y-6 sm:space-y-8">
                {/* Locale-specific Content Section */}
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-sm sm:text-base font-semibold">
                    {t('editor.localeContent')} ({getLocaleDisplayName(activeLocale)})
                  </h2>
                </div>

                <GuideMetadataForm
                  ref={formRef}
                  key={`guide-metadata-${activeLocale}-${activeTab}-${lastSaved?.getTime() ?? 0}`}
                  locale={activeLocale}
                  versionData={displayVersionData}
                  readOnly={isReadOnly}
                  onDirtyChange={handleDirtyChange}
                  onSave={save}
                />

                {/* Shared Content Section */}
                <Card className={isReadOnly ? 'opacity-60' : ''}>
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
                      disabled={isReadOnly}
                    />
                  </CardContent>
                </Card>

                {/* Stops Section */}
                <div className={isReadOnly ? 'opacity-60 pointer-events-none' : ''}>
                  <h3 className="mb-4 text-base font-medium">{tStops('title')}</h3>
                  <StopsList
                    onReorder={handleReorderStops}
                    onEdit={handleSelectStop}
                    onHide={handleHideStop}
                    onShow={handleShowStop}
                    onRemove={removeStop}
                    onAdd={async () => {
                      const newStop = await addStop()
                      if (newStop) {
                        router.navigate({
                          to: '/guides/$nanoId/stops/$stopId/edit',
                          params: { nanoId, stopId: newStop.nanoId },
                          search: localeSearch,
                        })
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Actions Panel (Desktop only) */}
          <aside className="hidden w-72 shrink-0 border-l bg-background lg:block self-start sticky top-35">
            <div className="p-5 space-y-6">
              <EditorActionsPanel
                contentType="guide"
                hasDraft={hasDraft}
                hasPublished={hasPublished}
                isDirty={isDirty}
                isSaving={isSaving}
                isPublishing={isPublishing}
                onSave={save}
                onPublish={handlePublish}
                onUnpublish={handleUnpublish}
                onDiscard={handleDiscard}
                onOpenVersionHistory={() => {}}
                disabled={isReadOnly}
              />

              <div className="border-t pt-5">
                <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t('editor.guideProgress')}
                </h3>
                <GuideProgress />
              </div>
            </div>
          </aside>
        </div>
      </div>

      <HideStopDialog
        open={!!stopToHide}
        onOpenChange={(open) => !open && setStopToHide(null)}
        stopTitle={stopToHide?.title ?? ''}
        onConfirm={handleConfirmHide}
      />

      <ShowStopDialog
        open={!!stopToShow}
        onOpenChange={(open) => !open && setStopToShow(null)}
        stopTitle={stopToShow?.title ?? ''}
        onConfirm={handleConfirmShow}
      />
    </>
  )
}
