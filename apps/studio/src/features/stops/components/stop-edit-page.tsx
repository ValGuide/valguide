import { useRouter } from '@tanstack/react-router'
import type { Asset } from '@valguide/core/features/assets/types'
import type { AssetWithRole } from '@valguide/core/features/guides/types'
import { useTranslations } from '@valguide/core/i18n/client'
import { Button } from '@valguide/ui/components/button'
import { ChevronLeft } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { MediaPickerConnected } from '@/features/assets/components/media-picker/media-picker-connected'
import { StopEditLayout, type StopTranslationData } from '@/features/guides/components/stop-edit-layout'
import type { StopLocaleEditorRef } from '@/features/guides/components/stop-locale-editor'
import { useUnsavedChangesGuard } from '@/features/guides/hooks/use-unsaved-changes-guard'
import { useStopEditor } from '@/features/stops/contexts/stop-editor-types'

interface StopEditPageProps {
  guideNanoId?: string
}

export function StopEditPage({ guideNanoId }: StopEditPageProps) {
  const router = useRouter()
  const tStops = useTranslations('stops')
  const {
    nanoId,
    stopId,
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
    updateAssets,
    registerFormDirty,
    unregisterForm,
    registerFormReset,
    navigation,
  } = useStopEditor()

  const { confirmIfDirty, dialog: unsavedChangesDialog } = useUnsavedChangesGuard({ isDirty })

  const stopTranslation: StopTranslationData | null = useMemo(() => {
    if (!localeDraft) return null
    return {
      stopId,
      translationId: '',
      currentVersionId: localeDraft.publishedVersionId,
      draftVersionId: null,
      currentVersion: localeDraft.publishedVersionId
        ? {
            title: localeDraft.title ?? '',
            description: localeDraft.description,
            transcription: localeDraft.transcription,
          }
        : null,
      draftVersion: {
        title: localeDraft.title ?? '',
        description: localeDraft.description,
        transcription: localeDraft.transcription,
      },
    }
  }, [localeDraft, stopId])

  const draftStopTitle = useMemo(() => {
    const title = localeDraft?.title
    return title?.trim() ? title : tStops('unknownTitle')
  }, [localeDraft, tStops])

  const publishedStopTitle = useMemo(() => {
    const title = localeDraft?.title
    return title?.trim() ? title : tStops('unknownTitle')
  }, [localeDraft, tStops])

  const stopEditorRef = useRef<StopLocaleEditorRef>(null)
  const formId = `stop-translation-${nanoId}-${activeLocale}`

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
    registerFormReset(formId, () => {
      stopEditorRef.current?.resetToCurrentValues()
    })
    return () => {
      unregisterForm(formId)
    }
  }, [formId, registerFormReset, unregisterForm])

  const handleBack = useCallback(() => {
    confirmIfDirty(() => {
      if (navigation.backParams?.nanoId) {
        router.navigate({
          to: '/guides/$nanoId/edit',
          params: { nanoId: navigation.backParams.nanoId },
        })
      } else {
        router.navigate({ to: '/stops' })
      }
    })
  }, [router, confirmIfDirty, navigation])

  const handlePublish = useCallback(
    async (_stopId: string, locale: string) => {
      try {
        await publish(locale)
        return { success: true }
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
      }
    },
    [publish],
  )

  const handleUnpublish = useCallback(
    async (_stopId: string, locale: string) => {
      try {
        await unpublish(locale)
        return { success: true }
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
      }
    },
    [unpublish],
  )

  const handleDiscard = useCallback(
    async (_stopId: string, _locale: string) => {
      try {
        await refetch()
        return { success: true }
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
      }
    },
    [refetch],
  )

  const breadcrumbContent = (
    <Button variant="ghost" size="sm" onClick={handleBack} className="-ml-2">
      <ChevronLeft className="h-4 w-4" />
      <span>{navigation.backLabel}</span>
    </Button>
  )

  return (
    <>
      {unsavedChangesDialog}
      <StopEditLayout
        stopId={stopId}
        guideNanoId={guideNanoId ?? ''}
        stopTranslation={stopTranslation}
        stopAssets={assets}
        activeLocale={activeLocale}
        isDirty={isDirty}
        isSaving={isSaving}
        draftStopTitle={draftStopTitle}
        publishedStopTitle={publishedStopTitle}
        locales={availableLocales}
        onLocaleChange={setActiveLocale}
        onDirtyChange={handleDirtyChange}
        onSave={save}
        onRefetch={refetch}
        stopEditorRef={stopEditorRef}
        breadcrumbContent={breadcrumbContent}
        MediaPicker={MediaPickerConnected}
        onPublish={handlePublish}
        onUnpublish={handleUnpublish}
        onDiscard={handleDiscard}
        lastSaved={lastSaved}
        onImageChange={(newAssets: Asset[]) => {
          const audioAssets = assets.filter((a) => a.role === 'audio')
          const newMediaAssets: AssetWithRole[] = newAssets.map((asset, index) => ({
            ...asset,
            role: asset.type?.startsWith('video/') ? 'video' : 'image',
            order: index,
            locale: null,
          }))
          updateAssets([...newMediaAssets, ...audioAssets])
        }}
        onAudioChange={(asset: Asset | null) => {
          const nonAudioAssets = assets.filter((a) => a.role !== 'audio' || a.locale !== activeLocale)
          if (asset) {
            const audioAsset: AssetWithRole = {
              ...asset,
              role: 'audio',
              order: nonAudioAssets.length,
              locale: activeLocale,
            }
            updateAssets([...nonAudioAssets, audioAsset])
          } else {
            updateAssets(nonAudioAssets)
          }
        }}
      />
    </>
  )
}
