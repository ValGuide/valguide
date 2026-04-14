import type { QueryObserverOptions } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import type { Asset } from '@valguide/core/features/assets/types'
import { getStopTranslationStatusDisplay } from '@valguide/core/features/tours/status-utils'
import type { StopAssetDraftItem } from '@valguide/core/features/tours/stop/asset/get-stop-assets-draft.fn'
import { useTranslations } from '@valguide/core/i18n/client'
import { captureStudioClientEvent } from '@valguide/core/posthog/PostHogProvider'
import { toast } from '@valguide/core/ui/components/sonner/state'
import { Button } from '@valguide/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@valguide/ui/components/card'
import { ChevronLeft, Globe } from 'lucide-react'
import { type ComponentType, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { MediaPickerComponent } from '@/features/assets/components/media-picker/types'
import { BaseEditLayout, type StatusDisplay } from '@/features/editor/components/base-edit-layout'
import { useAutoSave } from '@/features/editor/hooks/use-auto-save'
import type { DiffResult } from '@/features/editor/hooks/use-diff-view'
import { useDiffView } from '@/features/editor/hooks/use-diff-view'
import { useEnableAfterMount } from '@/features/editor/hooks/use-enable-after-mount'
import { useUnsavedChangesGuard } from '@/features/editor/hooks/use-unsaved-changes-guard'
import { SharedStopBanner } from '@/features/stops/components/shared-stop-banner'
import {
  StopLocaleEditorWithDiff,
  type StopLocaleEditorWithDiffRef,
} from '@/features/stops/components/stop-locale-editor-with-diff'
import { useStopEditor } from '@/features/stops/contexts/stop-editor-types'

export type StopEditPageProps = {
  MediaPicker: MediaPickerComponent
  onPublishAssets?: (nanoId: string, activeLocale: string) => Promise<void>
  StopQrPanel?: ComponentType<{ downloadFileName: string }> | null
  /** Query options for diff view - pass undefined for Storybook to skip the query */
  diffQueryOptions?: QueryObserverOptions<DiffResult>
}

export function StopEditPage({ MediaPicker, onPublishAssets, StopQrPanel, diffQueryOptions }: StopEditPageProps) {
  const router = useRouter()
  const t = useTranslations('tours')
  const tStops = useTranslations('stops')
  const {
    nanoId,
    stopId,
    isInTourContext,
    localeDraft,
    activeLocale,
    availableLocales,
    isDirty,
    isSaving,
    lastSaved,
    assets,
    setActiveLocale,
    save,
    refetch,
    publish,
    unpublish,
    discard,
    updateAssets,
    registerFormDirty,
    unregisterForm,
    registerFormReset,
    navigation,
    tourUsage,
  } = useStopEditor()

  const [isPublishing, setIsPublishing] = useState(false)
  const secondaryPanelsEnabled = useEnableAfterMount()

  const { confirmIfDirty, dialog: unsavedChangesDialog } = useUnsavedChangesGuard({ isDirty })

  // Diff view state
  const { diffEnabled, setDiffEnabled, changedCount, getFieldDiff } = useDiffView({
    enabled: secondaryPanelsEnabled,
    queryOptions: secondaryPanelsEnabled ? diffQueryOptions : undefined,
  })

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

  const draftStopTitle = useMemo(() => {
    const title = localeDraft?.title
    return title?.trim() ? title : tStops('unknownTitle')
  }, [localeDraft, tStops])

  const stopTitle = draftStopTitle
  const qrDownloadFileName = localeDraft?.title?.trim() || nanoId

  const draftData = localeDraft
    ? {
        title: localeDraft.title ?? '',
        description: localeDraft.description ?? '',
        transcription: localeDraft.transcription ?? '',
      }
    : null

  const displayData = draftData ?? { title: '', description: '', transcription: '' }

  const displayAssets = assets
  const stopImageItems = displayAssets.filter((a) => a.channel === 'images.gallery' && a.locale === null)
  const stopAudioItem = displayAssets.find((a) => a.channel === 'audio.narration' && a.locale === activeLocale) ?? null
  // Extract assets for MediaPicker (which expects Asset, not *Item)
  const stopImages = stopImageItems.map((item) => item.asset)
  const stopAudio = stopAudioItem?.asset ?? null

  const stopEditorRef = useRef<StopLocaleEditorWithDiffRef>(null)
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
        router.navigate({
          to: '/tours/$nanoId/edit',
          params: { nanoId: navigation.backParams.nanoId },
          search: { locale: activeLocale },
        })
      } else {
        router.navigate({ to: '/stops' })
      }
    })
  }, [router, confirmIfDirty, navigation, activeLocale])

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
      await refetch()
      setDiffEnabled(false)
    } catch (error) {
      console.error('Failed to publish:', error)
      toast.error(t('publish.error'))
    } finally {
      setIsPublishing(false)
    }
  }, [activeLocale, nanoId, refetch, publish, isDirty, save, t, onPublishAssets, setDiffEnabled])

  const handleUnpublish = useCallback(async () => {
    try {
      await unpublish(activeLocale)
      await refetch()
    } catch (error) {
      console.error('Failed to unpublish:', error)
      toast.error(t('unpublish.error'))
    }
  }, [activeLocale, refetch, unpublish])

  const handleDiscard = useCallback(async () => {
    try {
      await discard(activeLocale)
      await refetch()
    } catch (error) {
      console.error('Failed to discard:', error)
      toast.error(t('discard.error'))
    }
  }, [discard, activeLocale, refetch])

  const handleDiffToggle = useCallback(
    (enabled: boolean) => {
      captureStudioClientEvent('editor.diff_toggled', {
        content_type: 'stop',
        entity_nano_id: nanoId,
        locale: activeLocale,
        enabled,
      })
      setDiffEnabled(enabled)
    },
    [activeLocale, nanoId, setDiffEnabled],
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
      publishingDisabled={isInTourContext}
      activeLocale={activeLocale}
      availableLocales={availableLocales}
      onLocaleChange={setActiveLocale}
      isDirty={isDirty}
      isSaving={isSaving}
      isPublishing={isPublishing}
      onSave={save}
      onPublish={handlePublish}
      onUnpublish={handleUnpublish}
      onDiscard={handleDiscard}
      breadcrumbContent={breadcrumbContent}
      unsavedChangesDialog={unsavedChangesDialog}
    >
      <div className="space-y-6 sm:space-y-8" data-testid="stop-edit-page">
        {tourUsage && tourUsage.tourCount > 1 && <SharedStopBanner tourCount={tourUsage.tourCount} />}

        <div className="flex items-center justify-between gap-4">
          <h2 className="text-sm font-semibold sm:text-base">{tStops('editor.localeContent')}</h2>
        </div>

        <StopLocaleEditorWithDiff
          ref={stopEditorRef}
          key={`${stopId}-${activeLocale}-${lastSaved?.getTime() ?? 0}`}
          locale={activeLocale}
          audio={stopAudio}
          draftData={displayData}
          onDirtyChange={handleDirtyChange}
          onSave={save}
          onAudioChange={handleAudioChange}
          MediaPicker={MediaPicker}
          diffEnabled={diffEnabled}
          onDiffToggle={handleDiffToggle}
          changedCount={changedCount}
          getFieldDiff={getFieldDiff}
        />

        <Card>
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
            />
          </CardContent>
        </Card>

        {StopQrPanel && <StopQrPanel downloadFileName={qrDownloadFileName} />}
      </div>
    </BaseEditLayout>
  )
}
