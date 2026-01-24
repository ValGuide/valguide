import { createFileRoute, useRouter } from '@tanstack/react-router'
import type { Asset } from '@valguide/core/features/assets/types'
import type { AssetWithRole } from '@valguide/core/features/guides/types'
import { useTranslations } from '@valguide/core/i18n/client'
import { defaultLocale } from '@valguide/i18n/i18n.config'
import { Button } from '@valguide/ui/components/button'
import { ChevronLeft, Loader2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { MediaPickerConnected } from '@/features/assets/components/media-picker/media-picker-connected'
import { StopEditLayout, type StopTranslationData } from '@/features/guides/components/stop-edit-layout'
import type { StopLocaleEditorRef } from '@/features/guides/components/stop-locale-editor'
import { useUnsavedChangesGuard } from '@/features/guides/hooks/use-unsaved-changes-guard'
import { StopEditorProvider } from '@/features/stops/contexts/stop-editor-context'
import { useStopEditor } from '@/features/stops/contexts/stop-editor-types'
import { stopLocaleDataQueryOptions, stopMetadataQueryOptions } from '@/features/stops/query-options'

type SearchParams = {
  locale?: string
}

export const Route = createFileRoute('/_main/stops/$nanoId/edit')({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    locale: search.locale as string | undefined,
  }),
  loaderDeps: ({ search }) => ({ locale: search.locale }),
  loader: async ({ params, context, deps }) => {
    const metadata = await context.queryClient.ensureQueryData(stopMetadataQueryOptions(params.nanoId))

    if (metadata) {
      const activeLocale = deps.locale ?? defaultLocale
      await context.queryClient.ensureQueryData(stopLocaleDataQueryOptions(metadata.id, activeLocale))
    }

    return { nanoId: params.nanoId }
  },
  component: StopEditPage,
  pendingComponent: StopEditSkeleton,
})

function StopEditSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  )
}

function StopEditPage() {
  const { nanoId } = Route.useLoaderData()
  const { locale: editorLocale } = Route.useSearch()

  return (
    <StopEditorProvider nanoId={nanoId} initialLocale={editorLocale}>
      <StopEditContent />
    </StopEditorProvider>
  )
}

function StopEditContent() {
  const router = useRouter()
  const tStops = useTranslations('stops')
  const {
    nanoId,
    stopId,
    metadata,
    localeData,
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
  } = useStopEditor()

  const { confirmIfDirty, dialog: unsavedChangesDialog } = useUnsavedChangesGuard({ isDirty })

  // Build stop translation data from locale data
  const stopTranslation: StopTranslationData | null = useMemo(() => {
    if (!localeData?.stopTranslation || !stopId) return null
    const { stopTranslation: st } = localeData
    return {
      stopId,
      translationId: st.translationId,
      currentVersionId: st.currentVersionId,
      draftVersionId: st.draftVersionId,
      currentVersion: st.currentVersion,
      draftVersion: st.draftVersion,
    }
  }, [localeData, stopId])

  // Get stop title
  const draftStopTitle = useMemo(() => {
    const title = stopTranslation?.draftVersion?.title ?? stopTranslation?.currentVersion?.title
    return title?.trim() ? title : tStops('unknownTitle')
  }, [stopTranslation, tStops])

  const publishedStopTitle = useMemo(() => {
    const title = stopTranslation?.currentVersion?.title
    return title?.trim() ? title : tStops('unknownTitle')
  }, [stopTranslation, tStops])

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

  const handleBackToStops = useCallback(() => {
    confirmIfDirty(() => router.navigate({ to: '/stops' }))
  }, [router, confirmIfDirty])

  // Publishing handlers that wrap the context methods
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
    async (_stopId: string, locale: string) => {
      try {
        await discard(locale)
        return { success: true }
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
      }
    },
    [discard],
  )

  const breadcrumbContent = (
    <Button variant="ghost" size="sm" onClick={handleBackToStops} className="-ml-2">
      <ChevronLeft className="h-4 w-4" />
      <span>{tStops('backToStops')}</span>
    </Button>
  )

  if (!metadata) {
    return <StopEditSkeleton />
  }

  return (
    <>
      {unsavedChangesDialog}
      <StopEditLayout
        stopId={stopId}
        guideNanoId="" // Empty for independent editing
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
          // Replace all media assets (images/videos) with the new list
          // Keep audio assets unchanged
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
          // Update audio for current locale
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
