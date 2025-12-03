'use client'

import { PublishStopTranslationButton } from '@valguide/core/features/guides/components/publish-stop-translation-button'
import { VersionHistoryDialogStop } from '@valguide/core/features/guides/components/version-history-dialog-stop'
import type { StopWithAssets } from '@valguide/core/features/guides/queries'
import { Link, useRouter } from '@valguide/i18n/routing'
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@valguide/ui/components/breadcrumb'
import { Button } from '@valguide/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@valguide/ui/components/dropdown-menu'
import { ArrowLeft } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useRef } from 'react'
import { LocaleTabs } from '@/features/guides/components/locale-tabs'
import { StopEditor, type StopEditorRef } from '@/features/guides/components/stop-editor'
import { useGuideEditor } from '@/features/guides/contexts/guide-editor-context'
import { useAutoSave } from '@/features/guides/hooks/use-auto-save'
import { useUnsavedChangesGuard } from '@/features/guides/hooks/use-unsaved-changes-guard'
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
    setActiveLocale,
    save,
    registerFormDirty,
    unregisterForm,
    registerFormReset,
  } = useGuideEditor()

  const foundStop = guide.stops.find((s) => s.id === stopProp.id)
  const stop: StopWithAssets = foundStop ?? stopProp

  const { confirmIfDirty, dialog: unsavedChangesDialog } = useUnsavedChangesGuard({ isDirty })

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

  useAutoSave(save, isDirty)

  const currentStopTranslation = stop.translations.find((tr) => tr.locale === activeLocale)

  // Filter assets by role and locale for the current stop
  const stopImages = stop.assets.filter(
    (a) => (a.role === 'image' || a.role === 'video') && (a.locale === activeLocale || a.locale === null),
  )
  const stopAudio =
    stop.assets.find((a) => a.role === 'audio' && (a.locale === activeLocale || a.locale === null)) ?? null

  const stopEditorRef = useRef<StopEditorRef>(null)
  const formId = `stop-translation-${stop.id}-${activeLocale}`

  const handleDirtyChange = useCallback(
    (formIsDirty: boolean) => {
      registerFormDirty(formId, formIsDirty)
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

  const handleBackToGuide = () => {
    confirmIfDirty(() => router.push(`/guides/${guide.nanoId}/edit`))
  }

  const handleStopChange = useCallback(
    (data: StopTranslationFormData) => {
      updateStopTranslationData(stop.id, activeLocale, data)
    },
    [stop.id, activeLocale, updateStopTranslationData],
  )

  return (
    <>
      {unsavedChangesDialog}
      <div className="flex h-[calc(100vh-4rem)] flex-col overflow-x-hidden bg-background">
        {/* Header */}
        <div className="border-b bg-background px-3 py-3 sm:px-6">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <Breadcrumb className="hidden min-w-0 flex-1 lg:flex">
              <BreadcrumbList className="flex-nowrap">
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/">{t('title')}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                {/* Collapsed items on lg, expanded on xl */}
                <BreadcrumbItem className="xl:hidden">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-1">
                      <BreadcrumbEllipsis className="h-4 w-4" />
                      <span className="sr-only">Toggle menu</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem asChild>
                        <Link href={guideDetailUrl}>{guideTitle}</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleBackToGuide}>{t('breadcrumb.stops')}</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="xl:hidden" />
                {/* Expanded items on xl */}
                <BreadcrumbItem className="hidden xl:list-item">
                  <BreadcrumbLink asChild className="block max-w-[180px] truncate">
                    <Link href={guideDetailUrl}>{guideTitle}</Link>
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
                <BreadcrumbItem>
                  <BreadcrumbPage className="block max-w-[150px] truncate">{stopTitle}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className="ml-auto flex shrink-0 flex-wrap items-center gap-1 sm:gap-2">
              <VersionHistoryDialogStop
                stopId={stop.id}
                locale={activeLocale}
                onRollback={() => {
                  router.refresh()
                }}
              />
              <PublishStopTranslationButton
                stopId={stop.id}
                locale={activeLocale}
                hasDraft={!!currentStopTranslation?.draftVersionId}
                onPublished={() => {
                  router.refresh()
                }}
              />
              <Button variant="ghost" size="sm" className="hidden sm:flex">
                {t('editor.preview')}
              </Button>
              <Button onClick={save} disabled={isSaving || !isDirty} size="sm">
                {isSaving ? t('editor.saving') : t('editor.save')}
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex min-w-0 flex-1 overflow-hidden">
          <div className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-background">
            <div className="mx-auto w-full max-w-4xl p-4 sm:p-6 lg:p-8">
              <div className="space-y-6">
                <Button variant="ghost" size="sm" onClick={handleBackToGuide} className="gap-1">
                  <ArrowLeft className="h-4 w-4" />
                  {t('editor.backToGuide')}
                </Button>

                <LocaleTabs value={activeLocale} onValueChange={setActiveLocale} />

                <StopEditor
                  ref={stopEditorRef}
                  key={`${stop.id}-${activeLocale}`}
                  stop={stop}
                  locale={activeLocale}
                  organizationId={organizationId}
                  images={stopImages}
                  audio={stopAudio}
                  onChange={handleStopChange}
                  onDirtyChange={handleDirtyChange}
                  onImageChange={async (assets) => {
                    for (const asset of assets) {
                      await attachAssetToStop(stop.id, asset, 'image', activeLocale)
                    }
                  }}
                  onAudioChange={async (asset) => {
                    if (asset) {
                      await attachAssetToStop(stop.id, asset, 'audio', activeLocale)
                    }
                  }}
                />
              </div>
            </div>
          </div>

          <div className="hidden w-80 shrink-0 border-l bg-background p-6 lg:block">
            <h3 className="mb-4 text-base font-semibold">{t('editor.stopProgress')}</h3>
            {/* TODO: Add stop-specific progress */}
          </div>
        </div>
      </div>
    </>
  )
}
