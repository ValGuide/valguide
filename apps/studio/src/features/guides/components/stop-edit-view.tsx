import { useRouter } from '@tanstack/react-router'
import { useTranslations } from '@valguide/core/i18n/client'
import { defaultLocale } from '@valguide/i18n/i18n.config'
import { Button } from '@valguide/ui/components/button'
import { ChevronLeft } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import type { MediaPickerComponent } from '@/features/assets/components/media-picker/types'
import { StopEditLayout } from '@/features/guides/components/stop-edit-layout'
import type { StopLocaleEditorRef } from '@/features/guides/components/stop-locale-editor'
import { useGuideEditor } from '@/features/guides/contexts/guide-editor-types'

interface StopEditViewProps {
  stopId: string
  MediaPicker: MediaPickerComponent
  onPublish: (stopId: string, locale: string) => Promise<{ success: boolean; error?: string }>
  onUnpublish: (stopId: string, locale: string) => Promise<{ success: boolean; error?: string }>
  onDiscard: (stopId: string, locale: string) => Promise<{ success: boolean; error?: string }>
}

export function StopEditView({ stopId, MediaPicker, onPublish, onUnpublish, onDiscard }: StopEditViewProps) {
  const router = useRouter()
  const t = useTranslations('guides')
  const tStops = useTranslations('stops')
  const {
    nanoId,
    metadata,
    localeData,
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

  // Get stop metadata (has both id and nanoId)
  const stopMetadata = useMemo(() => {
    return metadata?.stops.find((s) => s.nanoId === stopId)
  }, [metadata, stopId])

  // Get stop title from locale data (using stopId UUID from metadata)
  const stopTranslation = useMemo(() => {
    if (!stopMetadata) return undefined
    return localeData?.stopTranslations.find((st) => st.stopId === stopMetadata.id)
  }, [localeData, stopMetadata])

  const draftStopTitle = useMemo(() => {
    const title = stopTranslation?.draftVersion?.title ?? stopTranslation?.currentVersion?.title
    return title?.trim() ? title : tStops('unknownTitle')
  }, [stopTranslation, tStops])

  const publishedStopTitle = useMemo(() => {
    const title = stopTranslation?.currentVersion?.title
    return title?.trim() ? title : tStops('unknownTitle')
  }, [stopTranslation, tStops])

  const stopAssets = useMemo(() => {
    if (!stopMetadata) return []
    return getStopAssets(stopMetadata.id)
  }, [stopMetadata, getStopAssets])

  const stopEditorRef = useRef<StopLocaleEditorRef>(null)
  const formId = `stop-translation-${stopId}-${activeLocale}`

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
    registerFormReset(
      formId,
      () => {
        stopEditorRef.current?.resetToCurrentValues()
      },
      () => {
        stopEditorRef.current?.resetToFormValues()
      },
    )
    return () => {
      unregisterForm(formId)
    }
  }, [formId, registerFormReset, unregisterForm])

  const handleBackToGuide = useCallback(() => {
    router.navigate({ to: '/guides/$nanoId/edit', params: { nanoId }, search: localeSearch })
  }, [router, nanoId, localeSearch])

  const breadcrumbContent = (
    <Button variant="ghost" size="icon" onClick={handleBackToGuide} className="sm:size-auto sm:px-2">
      <ChevronLeft className="h-4 w-4" />
      <span className="hidden sm:inline ml-2">{t('editor.backToGuide')}</span>
    </Button>
  )

  if (!metadata || !stopMetadata) {
    return null
  }

  return (
    <StopEditLayout
      stopId={stopMetadata.id}
      stopTranslation={stopTranslation ?? null}
      stopAssets={stopAssets}
      stopTranslationStatuses={stopMetadata.translationStatuses}
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
      onPublish={onPublish}
      onUnpublish={onUnpublish}
      onDiscard={onDiscard}
      lastSaved={lastSaved}
      onImageChange={(assets) => {
        // Replace all media assets (images/videos) with the new list
        // Keep audio assets unchanged
        const audioAssets = stopAssets.filter((a) => a.role === 'audio')
        const newMediaAssets = assets.map((asset, index) => ({
          ...asset,
          role: asset.type?.startsWith('video/') ? 'video' : 'image',
          order: index,
          locale: null,
        }))
        updateStopAssets(stopMetadata.id, [...newMediaAssets, ...audioAssets])
      }}
      onAudioChange={(asset) => {
        // Update audio for current locale
        const nonAudioAssets = stopAssets.filter((a) => a.role !== 'audio' || a.locale !== activeLocale)
        if (asset) {
          const audioAsset = {
            ...asset,
            role: 'audio',
            order: nonAudioAssets.length,
            locale: activeLocale,
          }
          updateStopAssets(stopMetadata.id, [...nonAudioAssets, audioAsset])
        } else {
          updateStopAssets(stopMetadata.id, nonAudioAssets)
        }
      }}
    />
  )
}
