import type { Asset } from '@valguide/core/features/assets/types'
import { ContentStatusBadge, getContentStatus } from '@valguide/core/features/guides/components/content-status-badge'
import type { AssetWithRole, TranslationStatus } from '@valguide/core/features/guides/types'
import { useTranslations } from '@valguide/core/i18n/client'

// Type for stop translation from locale data
export type StopTranslationData = {
  stopId: string
  translationId: string
  currentVersionId: string | null
  draftVersionId: string | null
  currentVersion: { id: string; title: string; description: string | null; transcription: string | null } | null
  draftVersion: { id: string; title: string; description: string | null; transcription: string | null } | null
}

import { toast } from '@valguide/core/ui/components/sonner/state'
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
import { type ReactNode, useCallback, useMemo, useRef, useState } from 'react'
import type { MediaPickerComponent } from '@/features/assets/components/media-picker/types'
import { DraftPublishedTabs, type EditorTab } from '@/features/guides/components/draft-published-tabs'
import { EditorActionsPanel } from '@/features/guides/components/editor-actions-panel'
import { LocaleSelector } from '@/features/guides/components/locale-selector'
import { StopLocaleEditor, type StopLocaleEditorRef } from '@/features/guides/components/stop-locale-editor'
import { useAutoSave } from '@/features/guides/hooks/use-auto-save'
import { useUnsavedChangesGuard } from '@/features/guides/hooks/use-unsaved-changes-guard'

import { getLocaleStatusMapFromStatuses, type LocaleStatusMap } from '@/features/guides/utils/translation-status'

export interface StopEditLayoutProps {
  stopId: string
  stopTranslation: StopTranslationData | null
  stopAssets: AssetWithRole[]
  stopTranslationStatuses: TranslationStatus[]
  activeLocale: string
  isDirty: boolean
  isSaving: boolean
  draftStopTitle: string
  publishedStopTitle: string
  locales?: string[]
  onLocaleChange: (locale: string) => void
  onDirtyChange: (dirty: boolean) => void
  onSave: () => Promise<void>
  onRefetch: () => void
  onBack: () => void
  backLabel: string
  onImageChange: (assets: Asset[]) => void
  onAudioChange: (asset: Asset | null) => void
  breadcrumbContent: ReactNode
  stopEditorRef?: React.RefObject<StopLocaleEditorRef | null>
  MediaPicker: MediaPickerComponent
  onPublish: (stopId: string, locale: string) => Promise<{ success: boolean; error?: string }>
  onUnpublish: (stopId: string, locale: string) => Promise<{ success: boolean; error?: string }>
  onDiscard: (stopId: string, locale: string) => Promise<{ success: boolean; error?: string }>
  lastSaved?: Date | null
}

export function StopEditLayout({
  stopId,
  stopTranslation,
  stopAssets,
  stopTranslationStatuses,
  activeLocale,
  isDirty,
  isSaving,
  draftStopTitle,
  publishedStopTitle,
  locales,
  onLocaleChange,
  onDirtyChange,
  onSave,
  onRefetch,
  onBack,
  backLabel,
  onImageChange,
  onAudioChange,
  breadcrumbContent,
  stopEditorRef: externalRef,
  MediaPicker,
  onPublish,
  onUnpublish,
  onDiscard,
  lastSaved,
}: StopEditLayoutProps) {
  const t = useTranslations('guides')
  const tStops = useTranslations('stops')
  const internalRef = useRef<StopLocaleEditorRef>(null)
  const stopEditorRef = externalRef ?? internalRef

  const [activeTab, setActiveTab] = useState<EditorTab>('draft')
  const [isPublishing, setIsPublishing] = useState(false)

  const { confirmIfDirty, dialog: unsavedChangesDialog } = useUnsavedChangesGuard({ isDirty })

  const hasDraft = !!stopTranslation?.draftVersionId
  const hasPublished = !!stopTranslation?.currentVersionId
  const contentStatus = getContentStatus(hasDraft, hasPublished)

  const localeStatusMap: LocaleStatusMap = useMemo(() => {
    const baseMap = getLocaleStatusMapFromStatuses(stopTranslationStatuses, locales ?? ['en', 'de', 'rm'])
    return {
      ...baseMap,
      [activeLocale]: contentStatus,
    }
  }, [stopTranslationStatuses, locales, activeLocale, contentStatus])

  const isReadOnly = activeTab === 'published'
  const stopTitle = activeTab === 'published' ? publishedStopTitle : draftStopTitle

  const draftVersionData = stopTranslation?.draftVersion
    ? {
        title: stopTranslation.draftVersion.title,
        description: stopTranslation.draftVersion.description,
        transcription: stopTranslation.draftVersion.transcription,
      }
    : null

  const publishedVersionData = stopTranslation?.currentVersion
    ? {
        title: stopTranslation.currentVersion.title,
        description: stopTranslation.currentVersion.description,
        transcription: stopTranslation.currentVersion.transcription,
      }
    : null

  // For editing: use draft if available, otherwise fall back to published content
  // This ensures users always see the current content when editing
  const editableVersionData = draftVersionData ??
    publishedVersionData ?? {
      title: '',
      description: '',
      transcription: '',
    }

  // Convert null to undefined for component prop types
  const displayVersionData = isReadOnly ? (publishedVersionData ?? undefined) : editableVersionData

  const stopImages = stopAssets.filter((a) => (a.role === 'image' || a.role === 'video') && a.locale === null)
  const stopAudio = stopAssets.find((a) => a.role === 'audio' && a.locale === activeLocale) ?? null

  useAutoSave(onSave, isDirty)

  const handleBack = useCallback(() => {
    confirmIfDirty(onBack)
  }, [confirmIfDirty, onBack])

  const handleImagesChange = useCallback(
    (value: Asset | Asset[] | null) => {
      if (Array.isArray(value)) {
        onImageChange(value)
      } else if (value === null) {
        onImageChange([])
      }
    },
    [onImageChange],
  )

  const handlePublish = useCallback(async () => {
    setIsPublishing(true)
    try {
      if (isDirty) {
        await onSave()
      }
      const result = await onPublish(stopId, activeLocale)
      if (result.success) {
        toast.success(t('publish.success'))
        await onRefetch()
      } else {
        toast.error(result.error ?? t('publish.error'))
      }
    } catch (error) {
      console.error('Failed to publish:', error)
      toast.error(t('publish.error'))
    } finally {
      setIsPublishing(false)
    }
  }, [stopId, activeLocale, onRefetch, t, onPublish, isDirty, onSave])

  const handleUnpublish = useCallback(async () => {
    try {
      const result = await onUnpublish(stopId, activeLocale)
      if (result.success) {
        toast.success('Content unpublished')
        onRefetch()
      } else {
        toast.error(result.error ?? 'Failed to unpublish')
      }
    } catch (error) {
      console.error('Failed to unpublish:', error)
      toast.error('Failed to unpublish')
    }
  }, [stopId, activeLocale, onRefetch, onUnpublish])

  const handleDiscard = useCallback(async () => {
    try {
      const result = await onDiscard(stopId, activeLocale)
      if (result.success) {
        toast.success('Draft discarded')
        onRefetch()
      } else {
        toast.error('Failed to discard draft')
      }
    } catch (error) {
      console.error('Failed to discard:', error)
      toast.error('Failed to discard draft')
    }
  }, [stopId, activeLocale, onRefetch, onDiscard])

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

  return (
    <>
      {unsavedChangesDialog}
      <div className="min-h-[calc(100vh-4rem)] bg-background">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b bg-background px-3 py-3 sm:px-6">
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
              <LocaleSelector
                value={activeLocale}
                locales={locales ?? ['en', 'de', 'rm']}
                onValueChange={onLocaleChange}
                localeStatus={localeStatusMap}
              />
              <Button variant="ghost" size="sm" className="hidden sm:flex">
                {t('editor.preview')}
              </Button>
            </div>
          </div>
        </div>

        {/* Status Badge and Tabs */}
        <div className="sticky top-[57px] z-10 border-b bg-background px-3 py-3 sm:px-6">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={handleBack} className="gap-1 w-fit -ml-2">
                <ArrowLeft className="h-4 w-4" />
                {backLabel}
              </Button>
              <h1 className="text-xl font-semibold truncate">{stopTitle}</h1>
              <ContentStatusBadge status={contentStatus} size="lg" />
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
            <div className="mx-auto w-full max-w-4xl p-6 lg:p-8">
              <div className="space-y-8">
                {/* Locale-specific Content Section */}
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-base font-semibold">{tStops('editor.localeContent')}</h2>
                </div>

                <StopLocaleEditor
                  ref={stopEditorRef}
                  key={`${stopId}-${activeLocale}-${activeTab}-${lastSaved?.getTime() ?? 0}`}
                  locale={activeLocale}
                  audio={stopAudio}
                  versionData={displayVersionData}
                  readOnly={isReadOnly}
                  onDirtyChange={onDirtyChange}
                  onSave={onSave}
                  onAudioChange={onAudioChange}
                  MediaPicker={MediaPicker}
                />

                {/* Shared Content Section */}
                <Card className={isReadOnly ? 'opacity-60' : ''}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
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
                      disabled={isReadOnly}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Actions Panel */}
          <aside className="hidden w-72 shrink-0 border-l bg-background lg:block self-start sticky top-[140px]">
            <div className="p-5 space-y-6">
              <EditorActionsPanel
                hasDraft={hasDraft}
                hasPublished={hasPublished}
                isDirty={isDirty}
                isSaving={isSaving}
                isPublishing={isPublishing}
                onSave={onSave}
                onPublish={handlePublish}
                onUnpublish={handleUnpublish}
                onDiscard={handleDiscard}
                onOpenVersionHistory={() => {}}
                disabled={isReadOnly}
              />
            </div>
          </aside>
        </div>
      </div>
    </>
  )
}
