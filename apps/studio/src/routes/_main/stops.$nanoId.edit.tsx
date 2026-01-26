import { createFileRoute, notFound, redirect, useRouter } from '@tanstack/react-router'
import type { Asset } from '@valguide/core/features/assets/types'
import type { AssetWithRole } from '@valguide/core/features/guides/types'
import { useTranslations } from '@valguide/core/i18n/client'
import { Button } from '@valguide/ui/components/button'
import { ChevronLeft, Loader2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { MediaPickerConnected } from '@/features/assets/components/media-picker/media-picker-connected'
import { StopEditLayout, type StopTranslationData } from '@/features/guides/components/stop-edit-layout'
import type { StopLocaleEditorRef } from '@/features/guides/components/stop-locale-editor'
import { useUnsavedChangesGuard } from '@/features/guides/hooks/use-unsaved-changes-guard'
import { StopEditorProvider } from '@/features/stops/contexts/stop-editor-context'
import { useStopEditor } from '@/features/stops/contexts/stop-editor-types'
import { stopDetailQueryOptions, stopLocaleDraftQueryOptions } from '@/features/stops/query-options'

type SearchParams = {
  locale?: string
}

export const Route = createFileRoute('/_main/stops/$nanoId/edit')({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    locale: search.locale as string | undefined,
  }),
  loaderDeps: ({ search }) => ({ locale: search.locale }),
  loader: async ({ params, context, deps }) => {
    const stopDetail = await context.queryClient.ensureQueryData(stopDetailQueryOptions(params.nanoId))

    if (!stopDetail) {
      throw notFound()
    }

    const requestedLocale = deps.locale
    const { availableLocales } = stopDetail

    // Redirect if locale missing or invalid
    if (!requestedLocale || !availableLocales.includes(requestedLocale)) {
      const defaultLocale = availableLocales[0]
      if (!defaultLocale) throw notFound()
      throw redirect({
        to: '/stops/$nanoId/edit',
        params: { nanoId: params.nanoId },
        search: { locale: defaultLocale },
        replace: true,
      })
    }

    await context.queryClient.ensureQueryData(stopLocaleDraftQueryOptions(params.nanoId, requestedLocale))

    return { nanoId: params.nanoId, locale: requestedLocale }
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
  const { nanoId, locale } = Route.useLoaderData()

  return (
    <StopEditorProvider nanoId={nanoId} initialLocale={locale}>
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
    stopDetail,
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
  } = useStopEditor()

  const { confirmIfDirty, dialog: unsavedChangesDialog } = useUnsavedChangesGuard({ isDirty })

  // Build stop translation data from locale draft
  const stopTranslation: StopTranslationData | null = useMemo(() => {
    if (!localeDraft || !stopId) return null
    return {
      stopId,
      translationId: '', // Not used
      currentVersionId: localeDraft.publishedVersionId,
      draftVersionId: null, // Not used
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
    // Use draft title as fallback since we don't have separate published data
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

  const handleBackToStops = useCallback(() => {
    confirmIfDirty(() => router.navigate({ to: '/stops' }))
  }, [router, confirmIfDirty])

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
      // Discard = refetch to reset to server state
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
    <Button variant="ghost" size="sm" onClick={handleBackToStops} className="-ml-2">
      <ChevronLeft className="h-4 w-4" />
      <span>{tStops('backToStops')}</span>
    </Button>
  )

  if (!stopDetail) {
    return <StopEditSkeleton />
  }

  return (
    <>
      {unsavedChangesDialog}
      <StopEditLayout
        stopId={stopId}
        guideNanoId=""
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
