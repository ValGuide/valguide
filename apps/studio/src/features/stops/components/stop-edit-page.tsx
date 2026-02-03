import { useRouter } from '@tanstack/react-router'
import type { Asset } from '@valguide/core/features/assets/types'
import { getStopTranslationStatusDisplay } from '@valguide/core/features/guides/status-utils'
import type { StopAssetDraftItem } from '@valguide/core/features/guides/stop/asset/get-stop-assets-draft.fn'
import { useTranslations } from '@valguide/core/i18n/client'
import { toast } from '@valguide/core/ui/components/sonner/state'
import { Button } from '@valguide/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@valguide/ui/components/card'
import { ChevronLeft, Globe } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { MediaPickerComponent } from '@/features/assets/components/media-picker/types'
import { BaseEditLayout, type StatusDisplay } from '@/features/editor/components/base-edit-layout'
import type { EditorTab } from '@/features/editor/components/draft-published-tabs'
import { useAutoSave } from '@/features/editor/hooks/use-auto-save'
import { useUnsavedChangesGuard } from '@/features/editor/hooks/use-unsaved-changes-guard'
import { StopLocaleEditor, type StopLocaleEditorRef } from '@/features/stops/components/stop-locale-editor'
import { useStopEditor } from '@/features/stops/contexts/stop-editor-types'

export type StopEditPageProps = {
  MediaPicker: MediaPickerComponent
  onPublishAssets?: (nanoId: string, activeLocale: string) => Promise<void>
}

export function StopEditPage({ MediaPicker, onPublishAssets }: StopEditPageProps) {
  const router = useRouter()
  const t = useTranslations('guides')
  const tStops = useTranslations('stops')
  const {
    nanoId,
    stopId,
    localeDraft,
    localePublished,
    activeLocale,
    availableLocales,
    isDirty,
    isSaving,
    lastSaved,
    assets,
    assetsPublished,
    setActiveLocale,
    save,
    refetch,
    publish,
    unpublish,
    updateAssets,
    registerFormDirty,
    unregisterForm,
    registerFormReset,
    navigation,
  } = useStopEditor()

  const [activeTab, setActiveTab] = useState<EditorTab>('draft')
  const [isPublishing, setIsPublishing] = useState(false)

  const { confirmIfDirty, dialog: unsavedChangesDialog } = useUnsavedChangesGuard({ isDirty })

  const hasDraft = !!localeDraft
  const hasPublished = localeDraft?.hasPublished ?? false

  const statusDisplay: StatusDisplay = useMemo(() => {
    const display = getStopTranslationStatusDisplay(
      localeDraft
        ? {
            hasPublished: localeDraft.hasPublished,
          }
        : { hasPublished: false },
      null,
    )
    return { status: display.status, indicator: display.indicator }
  }, [localeDraft])

  const isReadOnly = activeTab === 'published'

  const draftStopTitle = useMemo(() => {
    const title = localeDraft?.title
    return title?.trim() ? title : tStops('unknownTitle')
  }, [localeDraft, tStops])

  const publishedStopTitle = useMemo(() => {
    const title = localePublished?.title
    return title?.trim() ? title : tStops('unknownTitle')
  }, [localePublished, tStops])

  const stopTitle = activeTab === 'published' ? publishedStopTitle : draftStopTitle

  const draftVersionData = localeDraft
    ? {
        title: localeDraft.title ?? '',
        description: localeDraft.description ?? '',
        transcription: localeDraft.transcription ?? '',
      }
    : null

  const publishedVersionData = localePublished
    ? {
        title: localePublished.title ?? '',
        description: localePublished.description ?? '',
        transcription: localePublished.transcription ?? '',
      }
    : null

  const editableVersionData = draftVersionData ??
    publishedVersionData ?? { title: '', description: '', transcription: '' }
  const displayVersionData = isReadOnly ? (publishedVersionData ?? undefined) : editableVersionData

  const displayAssets = isReadOnly ? assetsPublished : assets
  const stopImageItems = displayAssets.filter((a) => a.channel === 'images.gallery' && a.locale === null)
  const stopAudioItem = displayAssets.find((a) => a.channel === 'audio.narration' && a.locale === activeLocale) ?? null
  // Extract assets for MediaPicker (which expects Asset, not *Item)
  const stopImages = stopImageItems.map((item) => item.asset)
  const stopAudio = stopAudioItem?.asset ?? null

  const stopEditorRef = useRef<StopLocaleEditorRef>(null)
  const formId = `stop-translation-${nanoId}-${activeLocale}`

  useAutoSave(save, isDirty)

  const handleDirtyChange = useCallback(
    (formIsDirty: boolean) => {
      registerFormDirty(
        formId,
        formIsDirty,
        () => stopEditorRef.current?.getValues() ?? { title: '', description: '', transcription: '' },
      )
    },
    [formId, registerFormDirty],
  )

  useEffect(() => {
    registerFormReset(formId, () => stopEditorRef.current?.resetToCurrentValues())
    return () => unregisterForm(formId)
  }, [formId, registerFormReset, unregisterForm])

  const handleBack = useCallback(() => {
    confirmIfDirty(() => {
      if (navigation.backParams?.nanoId) {
        router.navigate({ to: '/guides/$nanoId/edit', params: { nanoId: navigation.backParams.nanoId } })
      } else {
        router.navigate({ to: '/stops' })
      }
    })
  }, [router, confirmIfDirty, navigation])

  const handleImagesChange = useCallback(
    (value: Asset | Asset[] | null) => {
      const audioAssets = assets.filter((a) => a.channel === 'audio.narration')
      if (Array.isArray(value)) {
        const newMediaAssets: StopAssetDraftItem[] = value.map((asset, index) => ({
          id: `temp-${asset.id}`,
          asset,
          channel: 'images.gallery',
          position: index,
          locale: null,
          createdAt: new Date(),
        }))
        updateAssets([...newMediaAssets, ...audioAssets])
      } else if (value === null) {
        updateAssets(audioAssets)
      }
    },
    [assets, updateAssets],
  )

  const handleAudioChange = useCallback(
    (asset: Asset | null) => {
      const nonAudioAssets = assets.filter((a) => a.channel !== 'audio.narration' || a.locale !== activeLocale)
      if (asset) {
        const audioItem: StopAssetDraftItem = {
          id: `temp-${asset.id}`,
          asset,
          channel: 'audio.narration',
          position: nonAudioAssets.length,
          locale: activeLocale,
          createdAt: new Date(),
        }
        updateAssets([...nonAudioAssets, audioItem])
      } else {
        updateAssets(nonAudioAssets)
      }
    },
    [assets, activeLocale, updateAssets],
  )

  const handlePublish = useCallback(async () => {
    setIsPublishing(true)
    try {
      if (isDirty) await save()
      await publish(activeLocale)
      await onPublishAssets?.(nanoId, activeLocale)
      toast.success(t('publish.success'))
      await refetch()
    } catch (error) {
      console.error('Failed to publish:', error)
      toast.error(t('publish.error'))
    } finally {
      setIsPublishing(false)
    }
  }, [activeLocale, nanoId, refetch, publish, isDirty, save, t, onPublishAssets])

  const handleUnpublish = useCallback(async () => {
    try {
      await unpublish(activeLocale)
      toast.success('Content unpublished')
      await refetch()
    } catch (error) {
      console.error('Failed to unpublish:', error)
      toast.error('Failed to unpublish')
    }
  }, [activeLocale, refetch, unpublish])

  const handleDiscard = useCallback(async () => {
    try {
      await refetch()
      toast.success('Draft discarded')
    } catch (error) {
      console.error('Failed to discard:', error)
      toast.error('Failed to discard draft')
    }
  }, [refetch])

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

  const breadcrumbContent = (
    <Button variant="ghost" size="sm" onClick={handleBack} className="-ml-2">
      <ChevronLeft className="h-4 w-4" />
      <span>{navigation.backLabel}</span>
    </Button>
  )

  return (
    <BaseEditLayout
      title={stopTitle}
      status={statusDisplay}
      hasDraft={hasDraft}
      hasPublished={hasPublished}
      contentType="stop"
      activeLocale={activeLocale}
      availableLocales={availableLocales}
      onLocaleChange={setActiveLocale}
      isDirty={isDirty}
      isSaving={isSaving}
      isPublishing={isPublishing}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      onSave={save}
      onPublish={handlePublish}
      onUnpublish={handleUnpublish}
      onDiscard={handleDiscard}
      breadcrumbContent={breadcrumbContent}
      unsavedChangesDialog={unsavedChangesDialog}
    >
      <div className="space-y-6 sm:space-y-8">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-sm font-semibold sm:text-base">{tStops('editor.localeContent')}</h2>
        </div>

        <StopLocaleEditor
          ref={stopEditorRef}
          key={`${stopId}-${activeLocale}-${activeTab}-${lastSaved?.getTime() ?? 0}`}
          locale={activeLocale}
          audio={stopAudio}
          versionData={displayVersionData}
          readOnly={isReadOnly}
          onDirtyChange={handleDirtyChange}
          onSave={save}
          onAudioChange={handleAudioChange}
          MediaPicker={MediaPicker}
        />

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
    </BaseEditLayout>
  )
}
