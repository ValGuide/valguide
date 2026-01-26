import { useRouter } from '@tanstack/react-router'
import { useTranslations } from '@valguide/core/i18n/client'
import { defaultLocale } from '@valguide/i18n/i18n.config'
import { Button } from '@valguide/ui/components/button'
import { ChevronLeft } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import type { MediaPickerComponent } from '@/features/assets/components/media-picker/types'
import { StopEditLayout, type StopTranslationData } from '@/features/guides/components/stop-edit-layout'
import type { StopLocaleEditorRef } from '@/features/guides/components/stop-locale-editor'
import { useGuideEditor } from '@/features/guides/contexts/guide-editor-types'
import { useUnsavedChangesGuard } from '@/features/guides/hooks/use-unsaved-changes-guard'

interface StopEditViewProps {
  stopNanoId: string
  MediaPicker: MediaPickerComponent
  onPublish: (nanoId: string, locale: string) => Promise<unknown>
  onUnpublish: (nanoId: string, locale: string) => Promise<unknown>
  onDiscard: (nanoId: string, locale: string) => Promise<unknown>
}

export function StopEditView({ stopNanoId, MediaPicker, onPublish, onUnpublish, onDiscard }: StopEditViewProps) {
  const router = useRouter()
  const t = useTranslations('guides')
  const tStops = useTranslations('stops')
  const {
    nanoId,
    guideDetail,
    stops,
    activeLocale,
    availableLocales,
    isDirty,
    isSaving,
    lastSaved,
    getStopAssets,
    updateStopAssets,
    setActiveLocale,
    save,
    refetch,
    registerFormDirty,
    unregisterForm,
    registerFormReset,
  } = useGuideEditor()

  const localeSearch = activeLocale !== defaultLocale ? { locale: activeLocale } : undefined

  const { confirmIfDirty, dialog: unsavedChangesDialog } = useUnsavedChangesGuard({ isDirty })

  // Get stop from structure
  const stop = useMemo(() => {
    return stops.find((s) => s.stopNanoId === stopNanoId)
  }, [stops, stopNanoId])

  // Build StopTranslationData for StopEditLayout (legacy interface)
  // The new schema doesn't have separate current/draft versions in the same shape,
  // so we adapt the localeDraft data
  const stopTranslation: StopTranslationData | null = useMemo(() => {
    if (!stop) return null
    // The StopEditLayout expects a specific shape - we pass minimal data
    // TODO: This interface should be updated to use the new flat schema
    return {
      stopId: stop.stopId,
      translationId: '', // Not used
      currentVersionId: null, // Not used in the new flow
      draftVersionId: null, // Not used in the new flow
      currentVersion: null, // Published version - would need separate query
      draftVersion: {
        title: stop.title ?? '',
        description: null, // Not in StructureDraftStop
        transcription: null, // Not in StructureDraftStop
      },
    }
  }, [stop])

  const draftStopTitle = useMemo(() => {
    return stop?.title?.trim() || tStops('unknownTitle')
  }, [stop, tStops])

  const publishedStopTitle = useMemo(() => {
    // Would need published version data
    return stop?.title?.trim() || tStops('unknownTitle')
  }, [stop, tStops])

  const stopAssets = useMemo(() => {
    if (!stop) return []
    return getStopAssets(stop.stopNanoId)
  }, [stop, getStopAssets])

  const stopEditorRef = useRef<StopLocaleEditorRef>(null)
  const formId = `stop-translation-${stopNanoId}-${activeLocale}`

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

  const handleBackToGuide = useCallback(() => {
    confirmIfDirty(() => router.navigate({ to: '/guides/$nanoId/edit', params: { nanoId }, search: localeSearch }))
  }, [router, nanoId, localeSearch, confirmIfDirty])

  const breadcrumbContent = (
    <Button variant="ghost" size="sm" onClick={handleBackToGuide} className="-ml-2">
      <ChevronLeft className="h-4 w-4" />
      <span>{t('editor.backToGuide')}</span>
    </Button>
  )

  if (!guideDetail || !stop) {
    return null
  }

  // Wrap server function calls to match expected signature
  const handlePublish = async (_stopId: string, locale: string) => {
    try {
      await onPublish(stopNanoId, locale)
      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  const handleUnpublish = async (_stopId: string, locale: string) => {
    try {
      await onUnpublish(stopNanoId, locale)
      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  const handleDiscard = async (_stopId: string, locale: string) => {
    try {
      await onDiscard(stopNanoId, locale)
      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  return (
    <>
      {unsavedChangesDialog}
      <StopEditLayout
        stopId={stop.stopId}
        guideNanoId={nanoId}
        stopTranslation={stopTranslation}
        stopAssets={stopAssets}
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
        MediaPicker={MediaPicker}
        onPublish={handlePublish}
        onUnpublish={handleUnpublish}
        onDiscard={handleDiscard}
        lastSaved={lastSaved}
        onImageChange={(assets) => {
          const audioAssets = stopAssets.filter((a) => a.role === 'audio')
          const newMediaAssets = assets.map((asset, index) => ({
            ...asset,
            role: asset.type?.startsWith('video/') ? 'video' : 'image',
            order: index,
            locale: null,
          }))
          updateStopAssets(stop.stopNanoId, [...newMediaAssets, ...audioAssets])
        }}
        onAudioChange={(asset) => {
          const nonAudioAssets = stopAssets.filter((a) => a.role !== 'audio' || a.locale !== activeLocale)
          if (asset) {
            const audioAsset = {
              ...asset,
              role: 'audio',
              order: nonAudioAssets.length,
              locale: activeLocale,
            }
            updateStopAssets(stop.stopNanoId, [...nonAudioAssets, audioAsset])
          } else {
            updateStopAssets(stop.stopNanoId, nonAudioAssets)
          }
        }}
      />
    </>
  )
}
