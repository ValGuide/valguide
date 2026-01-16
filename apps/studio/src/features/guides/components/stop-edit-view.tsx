import { Link, useRouter } from '@tanstack/react-router'
import { useTranslations } from '@valguide/core/i18n/client'
import {
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from '@valguide/ui/components/breadcrumb'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@valguide/ui/components/dropdown-menu'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import type { MediaPickerComponent } from '@/features/assets/components/media-picker/types'
import { StopEditLayout } from '@/features/guides/components/stop-edit-layout'
import type { StopLocaleEditorRef } from '@/features/guides/components/stop-locale-editor'
import { useGuideEditor } from '@/features/guides/contexts/guide-editor-types'
import { useLocaleUrl } from '@/features/guides/hooks/use-locale-url'

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
    attachAssetToStop,
    detachAssetFromStop,
    setActiveLocale,
    save,
    refetch,
    registerFormDirty,
    unregisterForm,
    registerFormReset,
  } = useGuideEditor()

  const { buildUrl } = useLocaleUrl(activeLocale)

  const guideDetailUrl = `/guides/${nanoId}`

  // Get guide title from locale data
  const guideTitle = useMemo(() => {
    const translation = localeData?.guideTranslation
    return translation?.currentVersion?.title ?? translation?.draftVersion?.title ?? t('untitledGuide')
  }, [localeData, t])

  // Get stop title from locale data
  const stopTranslation = useMemo(() => {
    return localeData?.stopTranslations.find((st) => st.stopId === stopId)
  }, [localeData, stopId])

  const draftStopTitle = useMemo(() => {
    const title = stopTranslation?.draftVersion?.title ?? stopTranslation?.currentVersion?.title
    return title?.trim() ? title : tStops('unknownTitle')
  }, [stopTranslation, tStops])

  const publishedStopTitle = useMemo(() => {
    const title = stopTranslation?.currentVersion?.title
    return title?.trim() ? title : tStops('unknownTitle')
  }, [stopTranslation, tStops])

  // Get stop assets from metadata
  const stopMetadata = useMemo(() => {
    return metadata?.stops.find((s) => s.id === stopId)
  }, [metadata, stopId])

  const stopImages = useMemo(() => {
    return stopMetadata?.assets.filter((a) => (a.role === 'image' || a.role === 'video') && a.locale === null) ?? []
  }, [stopMetadata])

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
    router.navigate({ to: buildUrl(`/guides/${nanoId}/edit`) })
  }, [router, buildUrl, nanoId])

  const breadcrumbContent = (
    <>
      <BreadcrumbItem>
        <BreadcrumbLink asChild>
          <Link to="/" preload="intent">
            {t('title')}
          </Link>
        </BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      {/* Collapsed items on lg, expanded on xl */}
      <BreadcrumbItem className="xl:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1">
            <BreadcrumbEllipsis className="h-4 w-4" />
            <span className="sr-only">{t('breadcrumb.toggleMenu')}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem asChild>
              <Link to={guideDetailUrl} preload="intent">
                {guideTitle}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleBackToGuide}>{t('breadcrumb.stops')}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </BreadcrumbItem>
      <BreadcrumbSeparator className="xl:hidden" />
      {/* Expanded items on xl */}
      <BreadcrumbItem className="hidden xl:list-item">
        <BreadcrumbLink asChild className="block max-w-[180px] truncate">
          <Link to={guideDetailUrl} preload="intent">
            {guideTitle}
          </Link>
        </BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator className="hidden xl:flex" />
      <BreadcrumbItem className="hidden xl:list-item">
        <BreadcrumbLink asChild>
          <button type="button" onClick={handleBackToGuide}>
            {t('breadcrumb.stops')}
          </button>
        </BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator className="hidden xl:flex" />
    </>
  )

  if (!metadata || !stopMetadata) {
    return null
  }

  return (
    <StopEditLayout
      stopId={stopId}
      stopTranslation={stopTranslation ?? null}
      stopAssets={stopMetadata.assets}
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
      onBack={handleBackToGuide}
      backLabel={t('editor.backToGuide')}
      stopEditorRef={stopEditorRef}
      breadcrumbContent={breadcrumbContent}
      MediaPicker={MediaPicker}
      onPublish={onPublish}
      onUnpublish={onUnpublish}
      onDiscard={onDiscard}
      lastSaved={lastSaved}
      onImageChange={async (assets) => {
        const newAssetIds = new Set(assets.map((a) => a.id))
        const currentAssetIds = new Set(stopImages.map((a) => a.id))

        for (const existing of stopImages) {
          if (!newAssetIds.has(existing.id) && existing.stopAssetId) {
            await detachAssetFromStop(existing.stopAssetId)
          }
        }

        for (const asset of assets) {
          if (!currentAssetIds.has(asset.id)) {
            await attachAssetToStop(stopId, asset, 'image', null)
          }
        }
      }}
      onAudioChange={async (asset) => {
        if (asset) {
          await attachAssetToStop(stopId, asset, 'audio', activeLocale)
        }
      }}
    />
  )
}
