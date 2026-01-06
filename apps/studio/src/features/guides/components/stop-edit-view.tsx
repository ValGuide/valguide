import { Link, useRouter } from '@tanstack/react-router'
import type { StopWithAssets } from '@valguide/core/features/guides/queries'
import { useTranslations } from '@valguide/core/i18n/mock'
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
import { useCallback, useEffect, useRef } from 'react'
import { StopEditLayout } from '@/features/guides/components/stop-edit-layout'
import type { StopLocaleEditorRef } from '@/features/guides/components/stop-locale-editor'
import { useGuideEditor } from '@/features/guides/contexts/guide-editor-context'
import { useLocaleUrl } from '@/features/guides/hooks/use-locale-url'
import type { StopTranslationFormData } from '@/features/guides/schemas/guide-form'

interface StopEditViewProps {
  stop: StopWithAssets
  organizationId?: string
}

export function StopEditView({ stop: stopProp, organizationId: organizationIdProp }: StopEditViewProps) {
  const router = useRouter()
  const t = useTranslations('guides')
  const tStops = useTranslations('stops')
  const {
    guide,
    activeLocale,
    isDirty,
    isSaving,
    updateStopTranslationData,
    attachAssetToStop,
    detachAssetFromStop,
    setActiveLocale,
    save,
    refetch,
    registerFormDirty,
    unregisterForm,
    registerFormReset,
  } = useGuideEditor()

  const foundStop = guide.stops.find((s) => s.id === stopProp.id)
  const stop: StopWithAssets = foundStop ?? stopProp

  const { buildUrl } = useLocaleUrl(activeLocale)

  const guideDetailUrl = `/guides/${guide.nanoId}`

  const guideTitle =
    guide.translations.find((tr) => tr.currentVersion?.title)?.currentVersion?.title ??
    guide.translations.find((tr) => tr.draftVersion?.title)?.draftVersion?.title ??
    t('untitledGuide')

  const stopTitle =
    stop.translations.find((tr) => tr.locale === activeLocale)?.currentVersion?.title ??
    stop.translations.find((tr) => tr.locale === activeLocale)?.draftVersion?.title ??
    tStops('untitled')

  const organizationId = organizationIdProp ?? ''

  const stopImages = stop.assets.filter((a) => (a.role === 'image' || a.role === 'video') && a.locale === null)

  const stopEditorRef = useRef<StopLocaleEditorRef>(null)
  const formId = `stop-translation-${stop.id}-${activeLocale}`

  const handleDirtyChange = useCallback(
    (formIsDirty: boolean) => {
      registerFormDirty(formId, formIsDirty)
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
    router.navigate({ to: buildUrl(`/guides/${guide.nanoId}/edit`) })
  }, [router, buildUrl, guide.nanoId])

  const handleStopChange = useCallback(
    (data: StopTranslationFormData) => {
      updateStopTranslationData(stop.id, activeLocale, data)
    },
    [stop.id, activeLocale, updateStopTranslationData],
  )

  const breadcrumbContent = (
    <>
      <BreadcrumbItem>
        <BreadcrumbLink asChild>
          <Link to="/">{t('title')}</Link>
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
              <Link to={guideDetailUrl}>{guideTitle}</Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleBackToGuide}>{t('breadcrumb.stops')}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </BreadcrumbItem>
      <BreadcrumbSeparator className="xl:hidden" />
      {/* Expanded items on xl */}
      <BreadcrumbItem className="hidden xl:list-item">
        <BreadcrumbLink asChild className="block max-w-[180px] truncate">
          <Link to={guideDetailUrl}>{guideTitle}</Link>
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

  return (
    <StopEditLayout
      stop={stop}
      activeLocale={activeLocale}
      isDirty={isDirty}
      isSaving={isSaving}
      organizationId={organizationId}
      stopTitle={stopTitle}
      locales={guide.availableLocales ?? ['en', 'de', 'rm']}
      onLocaleChange={setActiveLocale}
      onStopChange={handleStopChange}
      onDirtyChange={handleDirtyChange}
      onSave={save}
      onRefetch={refetch}
      onBack={handleBackToGuide}
      backLabel={t('editor.backToGuide')}
      stopEditorRef={stopEditorRef}
      breadcrumbContent={breadcrumbContent}
      onImageChange={async (assets) => {
        const newAssetIds = new Set(assets.map((a) => a.id))
        const currentAssetIds = new Set(stopImages.map((a) => a.id))

        for (const existing of stopImages) {
          if (!newAssetIds.has(existing.id) && existing.stopAssetId) {
            await detachAssetFromStop(stop.id, existing.id, existing.stopAssetId)
          }
        }

        for (const asset of assets) {
          if (!currentAssetIds.has(asset.id)) {
            await attachAssetToStop(stop.id, asset, 'image', null)
          }
        }
      }}
      onAudioChange={async (asset) => {
        if (asset) {
          await attachAssetToStop(stop.id, asset, 'audio', activeLocale)
        }
      }}
    />
  )
}
