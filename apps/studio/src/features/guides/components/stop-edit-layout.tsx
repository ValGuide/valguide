import type { Asset } from '@valguide/core/features/assets/schema'
import { ContentStatusBadge, getContentStatus } from '@valguide/core/features/guides/components/content-status-badge'
import type { StopWithAssets } from '@valguide/core/features/guides/queries'
import {
  discardStopTranslationDraftFn,
  publishStopTranslationDraftFn,
  unpublishStopTranslationFn,
} from '@valguide/core/features/guides/server-functions'
import { useTranslations } from '@valguide/core/i18n/client'

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
import { type ReactNode, useCallback, useRef, useState } from 'react'
import { toast } from 'sonner'
import { MediaPicker } from '@/features/assets/components/media-picker/media-picker'
import { DraftPublishedTabs, type EditorTab } from '@/features/guides/components/draft-published-tabs'
import { EditorActionsPanel } from '@/features/guides/components/editor-actions-panel'
import { LocaleSelector } from '@/features/guides/components/locale-selector'
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

  const [activeTab, setActiveTab] = useState<EditorTab>('draft')
  const [isPublishing, setIsPublishing] = useState(false)

  const { confirmIfDirty, dialog: unsavedChangesDialog } = useUnsavedChangesGuard({ isDirty })

  const currentStopTranslation = stop.translations.find((tr) => tr.locale === activeLocale)
  const localeStatusMap = getStopLocaleStatusMap(stop)

  const hasDraft = !!currentStopTranslation?.draftVersionId
  const hasPublished = !!currentStopTranslation?.currentVersionId
  const contentStatus = getContentStatus(hasDraft, hasPublished)

  const isReadOnly = activeTab === 'published'

  const draftVersionData = currentStopTranslation?.draftVersion
    ? {
        title: currentStopTranslation.draftVersion.title,
        description: currentStopTranslation.draftVersion.description,
        transcription: currentStopTranslation.draftVersion.transcription,
      }
    : undefined

  const publishedVersionData = currentStopTranslation?.currentVersion
    ? {
        title: currentStopTranslation.currentVersion.title,
        description: currentStopTranslation.currentVersion.description,
        transcription: currentStopTranslation.currentVersion.transcription,
      }
    : undefined

  const displayVersionData = isReadOnly ? publishedVersionData : draftVersionData

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

  const handlePublish = useCallback(async () => {
    setIsPublishing(true)
    try {
      const result = await publishStopTranslationDraftFn({ data: { stopId: stop.id, locale: activeLocale } })
      if (result.success) {
        toast.success(t('publish.success'))
        onRefetch()
        setActiveTab('published')
      } else {
        toast.error(result.error ?? t('publish.error'))
      }
    } catch (error) {
      console.error('Failed to publish:', error)
      toast.error(t('publish.error'))
    } finally {
      setIsPublishing(false)
    }
  }, [stop.id, activeLocale, onRefetch, t])

  const handleUnpublish = useCallback(async () => {
    try {
      const result = await unpublishStopTranslationFn({ data: { stopId: stop.id, locale: activeLocale } })
      if (result.success) {
        toast.success('Content unpublished')
        onRefetch()
        setActiveTab('draft')
      } else {
        toast.error(result.error ?? 'Failed to unpublish')
      }
    } catch (error) {
      console.error('Failed to unpublish:', error)
      toast.error('Failed to unpublish')
    }
  }, [stop.id, activeLocale, onRefetch])

  const handleDiscard = useCallback(async () => {
    try {
      const result = await discardStopTranslationDraftFn({ data: { stopId: stop.id, locale: activeLocale } })
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
  }, [stop.id, activeLocale, onRefetch])

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
          <div className="min-w-0 flex-1 bg-gray-50 dark:bg-background">
            <div className="mx-auto w-full max-w-4xl p-4 sm:p-6 lg:p-8">
              <div className="space-y-6">
                {/* Locale-specific Content Section */}
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-lg font-semibold">{tStops('editor.localeContent')}</h2>
                </div>

                <StopLocaleEditor
                  ref={stopEditorRef}
                  key={`${stop.id}-${activeLocale}-${activeTab}`}
                  stop={stop}
                  locale={activeLocale}
                  organizationId={organizationId}
                  audio={stopAudio}
                  versionData={displayVersionData}
                  readOnly={isReadOnly}
                  onChange={onStopChange}
                  onDirtyChange={onDirtyChange}
                  onSave={onSave}
                  onAudioChange={onAudioChange}
                />

                {/* Shared Content Section */}
                <Card className={isReadOnly ? 'opacity-60' : ''}>
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
                      disabled={isReadOnly}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Actions Panel */}
          <div className="hidden w-80 shrink-0 border-l bg-background p-6 lg:block self-start sticky top-[140px]">
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

            <div className="mt-8">
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t('editor.stopProgress')}
              </h3>
              {/* TODO: Add stop-specific progress */}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
