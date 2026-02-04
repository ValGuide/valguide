import type { QueryObserverOptions } from '@tanstack/react-query'
import { Link, useRouter } from '@tanstack/react-router'
import type { Asset } from '@valguide/core/features/assets/types'
import { useTranslations } from '@valguide/core/i18n/client'
import { toast } from '@valguide/core/ui/components/sonner/state'
import { defaultLocale } from '@valguide/i18n/i18n.config'
import { Button } from '@valguide/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@valguide/ui/components/card'
import { CommandSeparator } from '@valguide/ui/components/command'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@valguide/ui/components/sheet'
import { Globe, Languages, ListChecks } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { MediaPickerComponent } from '@/features/assets/components/media-picker/types'
import { BaseEditLayout, type StatusDisplay } from '@/features/editor/components/base-edit-layout'
import type { EditorTab } from '@/features/editor/components/draft-published-tabs'
import { getLocaleDisplayName } from '@/features/editor/components/locale-selector'
import type { DiffResult } from '@/features/editor/hooks/use-diff-view'
import { useDiffView } from '@/features/editor/hooks/use-diff-view'
import { useUnsavedChangesGuard } from '@/features/editor/hooks/use-unsaved-changes-guard'
import { HideStopDialog } from '@/features/tours/components/hide-stop-dialog'
import { ShowStopDialog } from '@/features/tours/components/show-stop-dialog'
import { StopsList } from '@/features/tours/components/stops-list'
import {
  TourMetadataFormWithDiff,
  type TourMetadataFormWithDiffRef,
} from '@/features/tours/components/tour-metadata-form-with-diff'
import { TourProgress } from '@/features/tours/components/tour-progress'
import type { TourIndicator, TourStatus } from '@/features/tours/components/tour-status-badge'
import { useTourEditor } from '@/features/tours/contexts/tour-editor-types'

export interface TourEditPageProps {
  onPublish?: (tourId: string, locale: string) => Promise<unknown>
  onUnpublish?: (tourId: string, locale: string) => Promise<unknown>
  onHideStop?: (tourId: string, stopNanoId: string) => Promise<unknown>
  onShowStop?: (tourId: string, stopNanoId: string) => Promise<unknown>
  MediaPicker: MediaPickerComponent
  /** Query options for diff view - pass undefined for Storybook to skip the query */
  diffQueryOptions?: QueryObserverOptions<DiffResult>
}

export function TourEditPage({
  onPublish,
  onUnpublish,
  onHideStop,
  onShowStop,
  MediaPicker,
  diffQueryOptions,
}: TourEditPageProps) {
  const router = useRouter()
  const t = useTranslations('tours')
  const tLocaleSelector = useTranslations('tours.localeSelector')
  const tStops = useTranslations('stops')
  const {
    nanoId,
    tourDetail,
    localeDraft,
    localePublished,
    activeLocale,
    availableLocales,
    isDirty,
    isSaving,
    lastSaved,
    tourAssets,
    tourAssetsPublished,
    setTourCover,
    removeStop,
    reorderStops,
    stops,
    setActiveLocale,
    save,
    refetch,
    registerFormDirty,
    unregisterForm,
    registerFormReset,
  } = useTourEditor()

  const [activeTab, setActiveTab] = useState<EditorTab>('draft')
  const [isPublishing, setIsPublishing] = useState(false)
  const [stopToHide, setStopToHide] = useState<{ id: string; title: string } | null>(null)
  const [stopToShow, setStopToShow] = useState<{ id: string; title: string } | null>(null)

  const { confirmIfDirty, dialog: unsavedChangesDialog } = useUnsavedChangesGuard({ isDirty })
  const localeSearch = activeLocale !== defaultLocale ? { locale: activeLocale } : undefined

  // Diff view state
  const { diffEnabled, setDiffEnabled, changedCount, getFieldDiff } = useDiffView({
    enabled: activeTab === 'draft',
    queryOptions: diffQueryOptions,
  })

  const tourTitle = useMemo(() => {
    const title = localeDraft?.title
    return title?.trim() ? title : t('unknownTitle')
  }, [localeDraft, t])

  const hasDraft = true
  const hasPublished = localeDraft?.hasPublished ?? false

  const computedStatusDisplay: StatusDisplay = useMemo(() => {
    if (!localeDraft) return { status: 'unpublished', indicator: null }
    const status: TourStatus = hasPublished ? 'published' : 'unpublished'
    const indicator: TourIndicator = 'up-to-date'
    return { status, indicator }
  }, [localeDraft, hasPublished])

  const stableStatusRef = useRef(computedStatusDisplay)
  if (!isPublishing) {
    stableStatusRef.current = computedStatusDisplay
  }
  const statusDisplay = isPublishing ? stableStatusRef.current : computedStatusDisplay

  const isReadOnly = activeTab === 'published'

  const draftVersionData = {
    title: localeDraft?.title ?? '',
    description: localeDraft?.description ?? '',
  }

  const publishedVersionData = localePublished
    ? { title: localePublished.title ?? '', description: localePublished.description ?? '' }
    : null

  const displayVersionData = isReadOnly ? publishedVersionData : draftVersionData

  const formRef = useRef<TourMetadataFormWithDiffRef>(null)
  const formId = `tour-translation-${activeLocale}`

  const handleDirtyChange = useCallback(
    (formIsDirty: boolean) => {
      registerFormDirty(formId, formIsDirty, () => formRef.current?.getValues() ?? { title: '', description: '' })
    },
    [formId, registerFormDirty],
  )

  useEffect(() => {
    registerFormReset(formId, () => formRef.current?.resetToCurrentValues())
    return () => unregisterForm(formId)
  }, [formId, registerFormReset, unregisterForm])

  const handleSelectStop = (stopNanoId: string) => {
    router.navigate({
      to: '/tours/$nanoId/stops/$stopId/edit',
      params: { nanoId, stopId: stopNanoId },
      search: localeSearch,
    })
  }

  const handleNavigateToTour = () => {
    confirmIfDirty(() => router.navigate({ to: '/tours/$nanoId', params: { nanoId } }))
  }

  const getStopTitle = useCallback(
    (stopNanoId: string) => stops.find((s) => s.stopNanoId === stopNanoId)?.title ?? tStops('untitled'),
    [stops, tStops],
  )

  const handleHideStop = useCallback(
    (stopNanoId: string) => setStopToHide({ id: stopNanoId, title: getStopTitle(stopNanoId) }),
    [getStopTitle],
  )

  const handleConfirmHide = useCallback(async () => {
    if (!stopToHide || !nanoId || !onHideStop) return
    await onHideStop(nanoId, stopToHide.id)
    await refetch()
  }, [stopToHide, nanoId, onHideStop, refetch])

  const handleShowStop = useCallback(
    (stopNanoId: string) => setStopToShow({ id: stopNanoId, title: getStopTitle(stopNanoId) }),
    [getStopTitle],
  )

  const handleConfirmShow = useCallback(async () => {
    if (!stopToShow || !nanoId || !onShowStop) return
    await onShowStop(nanoId, stopToShow.id)
    await refetch()
  }, [stopToShow, nanoId, onShowStop, refetch])

  const displayAssets = isReadOnly ? tourAssetsPublished : tourAssets
  const coverAssetItem = useMemo(() => displayAssets.find((a) => a.channel === 'images.hero') ?? null, [displayAssets])
  // Extract asset for MediaPicker (which expects Asset, not *Item)
  const coverAsset = coverAssetItem?.asset ?? null

  const handleCoverImageChange = useCallback(
    (value: Asset | Asset[] | null) => {
      if (value === null) setTourCover(null)
      else if (!Array.isArray(value)) setTourCover(value)
    },
    [setTourCover],
  )

  const handlePublish = useCallback(async () => {
    if (!onPublish) return
    setIsPublishing(true)
    try {
      if (isDirty) await save()
      await onPublish(nanoId, activeLocale)
      toast.success(t('publish.success'))
      await refetch()
    } catch (error) {
      console.error('Failed to publish:', error)
      toast.error(t('publish.error'))
    } finally {
      setIsPublishing(false)
    }
  }, [nanoId, activeLocale, refetch, onPublish, isDirty, save, t])

  const handleUnpublish = useCallback(async () => {
    if (!onUnpublish) return
    try {
      await onUnpublish(nanoId, activeLocale)
      toast.success(t('unpublish.success'))
      await refetch()
    } catch (error) {
      console.error('Failed to unpublish:', error)
      toast.error(t('unpublish.error'))
    }
  }, [nanoId, activeLocale, refetch, onUnpublish])

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

  if (!tourDetail) return null

  const mobileProgressSheet = (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <ListChecks className="h-4 w-4" />
          <span className="sr-only">{t('editor.tourProgress')}</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-75 p-6 sm:w-87.5">
        <SheetHeader>
          <SheetTitle>{t('editor.tourProgress')}</SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          <TourProgress />
        </div>
      </SheetContent>
    </Sheet>
  )

  const sidebarContent = (
    <>
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {t('editor.tourProgress')}
      </h3>
      <TourProgress />
    </>
  )

  const localeSelectorFooter = (
    <>
      <CommandSeparator />
      <div className="p-1">
        <Link
          to="/tours/$nanoId"
          params={{ nanoId }}
          className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <Languages className="h-4 w-4" />
          {tLocaleSelector('manageTranslations')}
        </Link>
      </div>
    </>
  )

  return (
    <>
      <BaseEditLayout
        title={tourTitle}
        status={statusDisplay}
        hasDraft={hasDraft}
        hasPublished={hasPublished}
        contentType="tour"
        activeLocale={activeLocale}
        availableLocales={availableLocales}
        onLocaleChange={setActiveLocale}
        localeSelectorFooter={localeSelectorFooter}
        isDirty={isDirty}
        isSaving={isSaving}
        isPublishing={isPublishing}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onSave={save}
        onPublish={handlePublish}
        onUnpublish={handleUnpublish}
        onDiscard={() => Promise.resolve()}
        backLabel={t('editor.tourDetails')}
        onBack={handleNavigateToTour}
        sidebar={sidebarContent}
        mobileHeaderExtra={mobileProgressSheet}
        unsavedChangesDialog={unsavedChangesDialog}
      >
        <div className="space-y-6 sm:space-y-8">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-sm font-semibold sm:text-base">
              {t('editor.localeContent')} ({getLocaleDisplayName(activeLocale)})
            </h2>
          </div>

          <TourMetadataFormWithDiff
            ref={formRef}
            key={`tour-metadata-${activeLocale}-${activeTab}-${lastSaved?.getTime() ?? 0}`}
            locale={activeLocale}
            versionData={
              displayVersionData ? { ...displayVersionData, title: displayVersionData.title ?? '' } : undefined
            }
            readOnly={isReadOnly}
            onDirtyChange={handleDirtyChange}
            onSave={save}
            diffEnabled={diffEnabled}
            onDiffToggle={setDiffEnabled}
            changedCount={changedCount}
            getFieldDiff={getFieldDiff}
          />

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

          <div className={isReadOnly ? 'pointer-events-none opacity-60' : ''}>
            <h3 className="mb-4 text-base font-medium">{tStops('title')}</h3>
            <StopsList
              onReorder={reorderStops}
              onEdit={handleSelectStop}
              onHide={handleHideStop}
              onShow={handleShowStop}
              onRemove={removeStop}
              onAdd={() => {
                router.navigate({
                  to: '/tours/$nanoId/stops/new',
                  params: { nanoId },
                  search: localeSearch,
                })
              }}
            />
          </div>
        </div>
      </BaseEditLayout>

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
