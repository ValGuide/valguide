import { useRouter } from '@tanstack/react-router'
import type { Asset } from '@valguide/core/features/assets/schema'
import { ContentStatusBadge, getContentStatus } from '@valguide/core/features/guides/components/content-status-badge'
import { useTranslations } from '@valguide/core/i18n/client'
import { toast } from '@valguide/core/ui/components/sonner/state'
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
import { Globe, ListChecks } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { MediaPickerComponent } from '@/features/assets/components/media-picker/types'
import { DraftPublishedTabs, type EditorTab } from '@/features/guides/components/draft-published-tabs'
import { EditorActionsPanel } from '@/features/guides/components/editor-actions-panel'
import { GuideMetadataForm, type GuideMetadataFormRef } from '@/features/guides/components/guide-metadata-form'
import { GuideProgress } from '@/features/guides/components/guide-progress'
import { MobileMoreMenu, MobileSavePublish } from '@/features/guides/components/mobile-action-bar'
import { StopsList } from '@/features/guides/components/stops-list'
import { getLocaleDisplayName, UnifiedLocaleSelector } from '@/features/guides/components/unified-locale-selector'
import { useGuideEditor } from '@/features/guides/contexts/guide-editor-types'
import { useAutoSave } from '@/features/guides/hooks/use-auto-save'
import { useLocaleUrl } from '@/features/guides/hooks/use-locale-url'
import { useUnsavedChangesGuard } from '@/features/guides/hooks/use-unsaved-changes-guard'
import { getLocaleStatusMapFromStatuses } from '@/features/guides/utils/translation-status'

interface GuideEditViewProps {
  onPublish?: (guideId: string, locale: string) => Promise<{ success: boolean; error?: string }>
  onUnpublish?: (guideId: string, locale: string) => Promise<{ success: boolean; error?: string }>
  onDiscard?: (guideId: string, locale: string) => Promise<{ success: boolean; error?: string }>
  MediaPicker: MediaPickerComponent
}

export function GuideEditView({ onPublish, onUnpublish, onDiscard, MediaPicker }: GuideEditViewProps) {
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
    deleteStop,
    reorderStops,
    setActiveLocale,
    updateAvailableLocales,
    save,
    refetch,
    registerFormDirty,
    unregisterForm,
    registerFormReset,
  } = useGuideEditor()

  const [activeTab, setActiveTab] = useState<EditorTab>('draft')
  const [isPublishing, setIsPublishing] = useState(false)

  const { confirmIfDirty, dialog: unsavedChangesDialog } = useUnsavedChangesGuard({ isDirty })
  const { buildUrl } = useLocaleUrl(activeLocale)

  const guideDetailUrl = `/guides/${nanoId}`

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
  const computedStatus = getContentStatus(hasDraft, hasPublished)

  // Store stable status during publishing to prevent flickering
  // Both badge and button update in the same render cycle
  const stableStatusRef = useRef(computedStatus)
  if (!isPublishing) {
    stableStatusRef.current = computedStatus
  }
  const contentStatus = isPublishing ? stableStatusRef.current : computedStatus

  // Build locale status map from metadata translation statuses
  const localeStatusMap = useMemo(() => {
    return getLocaleStatusMapFromStatuses(metadata?.translationStatuses, availableLocales)
  }, [metadata?.translationStatuses, availableLocales])

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

  const hasContentForLocale = useCallback(
    (locale: string) => {
      // For the active locale, check from localeData
      if (locale === activeLocale) {
        const t = localeData?.guideTranslation
        return !!(t?.currentVersionId || t?.draftVersionId)
      }
      // For other locales, we'd need to fetch - assume true for now
      return true
    },
    [activeLocale, localeData],
  )

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
    router.navigate({ to: buildUrl(`/guides/${nanoId}/stops/${stopId}/edit`) })
  }

  const handleNavigateToGuides = () => {
    confirmIfDirty(() => router.navigate({ to: '/' }))
  }

  const handleNavigateToGuideDetail = () => {
    confirmIfDirty(() => router.navigate({ to: guideDetailUrl }))
  }

  const handleReorderStops = (updates: Array<{ id: string; order: number }>) => {
    reorderStops(updates)
  }

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
  }, [guideId, activeLocale, refetch, onPublish, isDirty, save])

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
      <div className="min-h-[calc(100vh-4rem)] bg-background pb-16 sm:pb-0">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b bg-background px-4 py-2 sm:px-6 sm:py-3">
          {/* Mobile: Wrapping flex layout - order: locale | three dots | checklist */}
          <div className="flex flex-wrap items-center justify-end gap-2 lg:hidden">
            <UnifiedLocaleSelector
              value={activeLocale}
              locales={availableLocales}
              onValueChange={setActiveLocale}
              localeStatus={localeStatusMap}
              onAddLocale={async (locale) => {
                await updateAvailableLocales([...availableLocales, locale])
              }}
              onRemoveLocale={async (locale) => {
                await updateAvailableLocales(availableLocales.filter((l) => l !== locale))
              }}
              hasContentForLocale={hasContentForLocale}
            />
            <MobileMoreMenu
              hasDraft={hasDraft}
              hasPublished={hasPublished}
              onUnpublish={handleUnpublish}
              onDiscard={handleDiscard}
            />
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <ListChecks className="h-4 w-4" />
                  <span className="sr-only">{t('editor.guideProgress')}</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] p-6 sm:w-[350px]">
                <SheetHeader>
                  <SheetTitle>{t('editor.guideProgress')}</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <GuideProgress />
                </div>
              </SheetContent>
            </Sheet>
          </div>
          {/* Desktop: Single row with breadcrumb */}
          <div className="hidden lg:flex items-center justify-between gap-2">
            <Breadcrumb className="min-w-0 flex-1 overflow-x-auto">
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
            <div className="flex shrink-0 items-center gap-2">
              <UnifiedLocaleSelector
                value={activeLocale}
                locales={availableLocales}
                onValueChange={setActiveLocale}
                localeStatus={localeStatusMap}
                onAddLocale={async (locale) => {
                  await updateAvailableLocales([...availableLocales, locale])
                }}
                onRemoveLocale={async (locale) => {
                  await updateAvailableLocales(availableLocales.filter((l) => l !== locale))
                }}
                hasContentForLocale={hasContentForLocale}
              />
              <Button variant="ghost" size="sm">
                {t('editor.preview')}
              </Button>
            </div>
          </div>
        </div>

        {/* Status Badge and Tabs */}
        <div className="sticky top-[57px] z-10 border-b bg-background px-4 py-3 sm:px-6">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <h1 className="text-lg sm:text-xl font-semibold truncate min-w-0">{guideTitle}</h1>
              <ContentStatusBadge status={contentStatus} size="lg" className="shrink-0" />
            </div>
            <DraftPublishedTabs
              activeTab={activeTab}
              onTabChange={handleTabChange}
              hasDraft={hasDraft}
              hasPublished={hasPublished}
            />
          </div>
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
                    onDelete={deleteStop}
                    onAdd={async () => {
                      const newStop = await addStop()
                      if (newStop) {
                        router.navigate({ to: buildUrl(`/guides/${nanoId}/stops/${newStop.nanoId}/edit`) })
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Actions Panel (Desktop only) */}
          <aside className="hidden w-72 shrink-0 border-l bg-background lg:block self-start sticky top-[140px]">
            <div className="p-5 space-y-6">
              <EditorActionsPanel
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

      {/* Mobile bottom bar for save/publish - only on small screens */}
      <MobileSavePublish
        hasDraft={hasDraft}
        isDirty={isDirty}
        isSaving={isSaving}
        isPublishing={isPublishing}
        onSave={save}
        onPublish={handlePublish}
        disabled={isReadOnly}
      />
    </>
  )
}
