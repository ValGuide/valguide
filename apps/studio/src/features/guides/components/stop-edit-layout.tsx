import type { Asset } from '@valguide/core/features/assets/types'
import { GuideStatusBadge } from '@valguide/core/features/guides/components/guide-status-badge'
import { getStopTranslationStatusDisplay } from '@valguide/core/features/guides/status-utils'
import type { AssetWithRole } from '@valguide/core/features/guides/types'
import { useTranslations } from '@valguide/core/i18n/client'

// Simplified version content type (id not needed for layout)
type VersionContent = {
  title: string | null
  description: string | null
  transcription: string | null
}

// Type for stop translation from locale data
export type StopTranslationData = {
  stopId: string
  translationId: string
  currentVersionId: string | null
  draftVersionId: string | null
  currentVersion: VersionContent | null
  draftVersion: VersionContent | null
}

import { toast } from '@valguide/core/ui/components/sonner/state'
import { Button } from '@valguide/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@valguide/ui/components/card'

import { Globe } from 'lucide-react'
import { type ReactNode, useCallback, useRef, useState } from 'react'
import type { MediaPickerComponent } from '@/features/assets/components/media-picker/types'
import { DiscardConfirmationDialog } from '@/features/guides/components/discard-confirmation-dialog'
import { DraftPublishedTabs, type EditorTab } from '@/features/guides/components/draft-published-tabs'
import { EditorActionsPanel } from '@/features/guides/components/editor-actions-panel'
import { EditorHeader } from '@/features/guides/components/editor-header'
import { LocaleSelector } from '@/features/guides/components/locale-selector'
import { MobileMoreMenu, MobileSavePublish } from '@/features/guides/components/mobile-action-bar'
import { PublishConfirmationDialog } from '@/features/guides/components/publish-confirmation-dialog'
import { StopLocaleEditor, type StopLocaleEditorRef } from '@/features/guides/components/stop-locale-editor'
import { UnpublishConfirmationDialog } from '@/features/guides/components/unpublish-confirmation-dialog'
import { useAutoSave } from '@/features/guides/hooks/use-auto-save'
import { useUnsavedChangesGuard } from '@/features/guides/hooks/use-unsaved-changes-guard'

export interface StopEditLayoutProps {
  stopId: string
  guideNanoId: string
  stopTranslation: StopTranslationData | null
  stopAssets: AssetWithRole[]
  stopAssetsPublished: AssetWithRole[]
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
  guideNanoId,
  stopTranslation,
  stopAssets,
  stopAssetsPublished,
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

  // Confirmation dialog state (centralized for desktop + mobile action bars)
  const [publishDialogOpen, setPublishDialogOpen] = useState(false)
  const [unpublishDialogOpen, setUnpublishDialogOpen] = useState(false)
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false)

  const { confirmIfDirty, dialog: unsavedChangesDialog } = useUnsavedChangesGuard({ isDirty })

  const hasDraft = !!stopTranslation?.draftVersionId
  const hasPublished = !!stopTranslation?.currentVersionId

  // Stop translation status with change indicator
  const statusDisplay = getStopTranslationStatusDisplay(
    stopTranslation
      ? {
          currentVersionId: stopTranslation.currentVersionId,
          draftVersionId: stopTranslation.draftVersionId,
        }
      : { currentVersionId: null, draftVersionId: null },
    null,
  )

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

  // Use draft assets for editing, published assets for viewing
  const displayAssets = isReadOnly ? stopAssetsPublished : stopAssets

  const stopImages = displayAssets.filter((a) => (a.role === 'image' || a.role === 'video') && a.locale === null)
  const stopAudio = displayAssets.find((a) => a.role === 'audio' && a.locale === activeLocale) ?? null

  useAutoSave(onSave, isDirty)

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
      <div className="bg-background pb-16 sm:pb-0">
        {/* Mobile/Tablet Focus Mode Header */}
        <div className="sticky top-0 z-10 border-b bg-background lg:hidden">
          {/* Row 1: Breadcrumb/Back left, actions right */}
          <div className="flex items-center justify-between gap-2 px-4 py-3 sm:px-6 sm:py-4">
            <div className="shrink-0">{breadcrumbContent}</div>

            <div className="flex shrink-0 items-center gap-2">
              <LocaleSelector
                value={activeLocale}
                locales={locales ?? ['en']}
                onValueChange={onLocaleChange}
                guideNanoId={guideNanoId}
              />
              <MobileMoreMenu
                hasDraft={hasDraft}
                hasPublished={hasPublished}
                onUnpublishClick={() => setUnpublishDialogOpen(true)}
                onDiscardClick={() => setDiscardDialogOpen(true)}
              />
            </div>
          </div>

          {/* Row 2: Title + Status Badge */}
          <div className="flex flex-col gap-1 px-4 pb-3 sm:px-6">
            <div className="flex items-center gap-2">
              <h1 className="min-w-0 truncate text-lg font-semibold">{stopTitle}</h1>
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
          backContent={breadcrumbContent}
          className="hidden lg:flex"
          actions={
            <>
              <LocaleSelector
                value={activeLocale}
                locales={locales ?? ['en']}
                onValueChange={onLocaleChange}
                guideNanoId={guideNanoId}
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
                <h1 className="min-w-0 truncate text-lg font-semibold sm:text-xl">{stopTitle}</h1>
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
            onSave={onSave}
            onPublishClick={() => setPublishDialogOpen(true)}
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
                  <h2 className="text-sm sm:text-base font-semibold">{tStops('editor.localeContent')}</h2>
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

          {/* Right Sidebar - Actions Panel (Desktop only) */}
          <aside className="hidden w-72 shrink-0 border-l bg-background lg:block self-start sticky top-35">
            <div className="p-5 space-y-6">
              <EditorActionsPanel
                hasDraft={hasDraft}
                hasPublished={hasPublished}
                isDirty={isDirty}
                isSaving={isSaving}
                isPublishing={isPublishing}
                onSave={onSave}
                onPublishClick={() => setPublishDialogOpen(true)}
                onUnpublishClick={() => setUnpublishDialogOpen(true)}
                onDiscardClick={() => setDiscardDialogOpen(true)}
                onOpenVersionHistory={() => {}}
                disabled={isReadOnly}
              />
            </div>
          </aside>
        </div>
      </div>

      <PublishConfirmationDialog
        open={publishDialogOpen}
        onOpenChange={setPublishDialogOpen}
        isPublishing={isPublishing}
        onConfirm={handlePublish}
      />

      <UnpublishConfirmationDialog
        open={unpublishDialogOpen}
        onOpenChange={setUnpublishDialogOpen}
        contentType="stop"
        onConfirm={handleUnpublish}
      />

      <DiscardConfirmationDialog
        open={discardDialogOpen}
        onOpenChange={setDiscardDialogOpen}
        onConfirm={handleDiscard}
      />
    </>
  )
}
