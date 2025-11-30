'use client'

import type { Asset } from '@valguide/core/features/assets/schema'
import { PublishStopTranslationButton } from '@valguide/core/features/guides/components/publish-stop-translation-button'
import { PublishTranslationButton } from '@valguide/core/features/guides/components/publish-translation-button'
import { VersionHistoryDialog } from '@valguide/core/features/guides/components/version-history-dialog'
import { VersionHistoryDialogStop } from '@valguide/core/features/guides/components/version-history-dialog-stop'
import type { GuideWithStops } from '@valguide/core/features/guides/schema'
import { Link, useRouter } from '@valguide/i18n/routing'
import { Button } from '@valguide/ui/components/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@valguide/ui/components/sheet'
import { ArrowLeft, ChevronRight, ListChecks } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { GuideMetadataForm } from '@/features/guides/components/guide-metadata-form'
import { GuideProgress } from '@/features/guides/components/guide-progress'
import { LocaleTabs } from '@/features/guides/components/locale-tabs'
import { StopEditor } from '@/features/guides/components/stop-editor'
import { StopsList } from '@/features/guides/components/stops-list'
import { GuideEditorProvider, useGuideEditor } from '@/features/guides/contexts/guide-editor-context'
import { useAutoSave } from '@/features/guides/hooks/use-auto-save'
import { useSidebarData } from '@/features/sidebar/hooks/use-sidebar-data'

export type GuideEditorClientProps = {
  guide: GuideWithStops
  initialStopId?: string
}

function GuideEditorContent() {
  const router = useRouter()
  const t = useTranslations('guides')
  const tStops = useTranslations('stops')
  const {
    guide,
    activeLocale,
    selectedStop,
    isDirty,
    isSaving,
    updateGuideTranslationData,
    updateCoverImage,
    selectStop,
    addStop,
    deleteStop,
    reorderStops,
    updateStopTranslationData,
    attachAssetToStop,
    setActiveLocale,
    save,
  } = useGuideEditor()

  const guideDetailUrl = `/guides/${guide.nanoId}`

  // Get guide title for breadcrumb (use first available from any locale)
  const guideTitle =
    guide.translations.find((t) => t.currentVersion?.title)?.currentVersion?.title ??
    guide.translations.find((t) => t.draftVersion?.title)?.draftVersion?.title ??
    t('untitledGuide')

  // Get selected stop title for breadcrumb
  const selectedStopTitle = selectedStop
    ? (selectedStop.translations.find((t) => t.locale === activeLocale)?.currentVersion?.title ??
      selectedStop.translations.find((t) => t.locale === activeLocale)?.draftVersion?.title ??
      tStops('untitled'))
    : null

  // Navigate to stop edit or back to guide edit
  const handleSelectStop = (stop: typeof selectedStop) => {
    if (stop) {
      router.push(`/guides/${guide.nanoId}/stops/${stop.id}/edit`)
    } else {
      router.push(`/guides/${guide.nanoId}/edit`)
    }
  }

  const { data: sidebarData } = useSidebarData()
  const organizationId = sidebarData?.currentTeam?.id ?? ''

  // Auto-save
  useAutoSave(save, isDirty)

  const currentTranslation = guide.translations.find((t) => t.locale === activeLocale)
  const currentStopTranslation = selectedStop?.translations.find((t) => t.locale === activeLocale)

  const handleReorderStops = (updates: Array<{ id: string; order: number }>) => {
    const reordered = [...guide.stops]
    updates.forEach(({ id, order }) => {
      const stopToUpdate = reordered.find((s) => s.id === id)
      if (stopToUpdate) stopToUpdate.order = order
    })
    reorderStops(reordered.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)))
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col overflow-x-hidden bg-background">
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-background px-3 py-3 sm:px-6">
        {/* Breadcrumb Navigation - hidden below lg to prioritize action buttons */}
        <nav className="hidden min-w-0 shrink items-center gap-1 text-sm text-muted-foreground lg:flex">
          <Link href="/guides" className="hover:text-foreground hover:underline">
            {t('title')}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href={guideDetailUrl} className="max-w-[200px] truncate hover:text-foreground hover:underline">
            {guideTitle}
          </Link>
          <ChevronRight className="h-4 w-4" />
          {!selectedStop ? (
            <span className="font-medium text-foreground">{t('editor.edit')}</span>
          ) : (
            <>
              <button
                type="button"
                onClick={() => handleSelectStop(null)}
                className="hover:text-foreground hover:underline"
              >
                {t('breadcrumb.stops')}
              </button>
              <ChevronRight className="h-4 w-4" />
              <span className="max-w-[150px] truncate font-medium text-foreground">{selectedStopTitle}</span>
            </>
          )}
        </nav>
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          {!selectedStop ? (
            <>
              <VersionHistoryDialog
                guideId={guide.id}
                locale={activeLocale}
                onRollback={() => {
                  router.refresh()
                }}
              />
              <PublishTranslationButton
                guideId={guide.id}
                locale={activeLocale}
                hasDraft={!!currentTranslation?.draftVersionId}
                onPublished={() => {
                  router.refresh()
                }}
              />
            </>
          ) : (
            <>
              <VersionHistoryDialogStop
                stopId={selectedStop.id}
                locale={activeLocale}
                onRollback={() => {
                  router.refresh()
                }}
              />
              <PublishStopTranslationButton
                stopId={selectedStop.id}
                locale={activeLocale}
                hasDraft={!!currentStopTranslation?.draftVersionId}
                onPublished={() => {
                  router.refresh()
                }}
              />
            </>
          )}
          <Button variant="ghost" size="sm" className="hidden sm:flex">
            {t('editor.preview')}
          </Button>
          {/* Mobile Progress Button */}
          {!selectedStop && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1 lg:hidden">
                  <ListChecks className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('editor.progress')}</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] p-6 sm:w-[350px]">
                <SheetHeader>
                  <SheetTitle>{t('editor.guideProgress')}</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <GuideProgress guide={guide} locale={activeLocale} />
                </div>
              </SheetContent>
            </Sheet>
          )}
          <Button onClick={save} disabled={isSaving || !isDirty} size="sm">
            {isSaving ? t('editor.saving') : t('editor.save')}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex min-w-0 flex-1 overflow-hidden">
        {/* Center Panel - Guide/Stop Editor */}
        <div className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-background">
          <div className="mx-auto w-full max-w-4xl p-4 sm:p-6 lg:p-8">
            {!selectedStop ? (
              <div className="space-y-6">
                {/* Guide Details Header */}
                <div>
                  <h2 className="mb-4 text-lg font-semibold">{t('editor.guideDetails')}</h2>

                  {/* Locale Tabs */}
                  <LocaleTabs value={activeLocale} onValueChange={setActiveLocale} />
                </div>

                {/* Guide Metadata */}
                <GuideMetadataForm
                  locale={activeLocale}
                  translation={currentTranslation}
                  coverImage={guide.coverImage}
                  organizationId={organizationId}
                  onTranslationChange={(data) => {
                    updateGuideTranslationData(activeLocale, data)
                  }}
                  onCoverImageChange={(url) => {
                    updateCoverImage(url)
                  }}
                />

                {/* Stops Section */}
                <div>
                  <h3 className="mb-4 text-base font-medium">{tStops('title')}</h3>
                  <StopsList
                    stops={guide.stops}
                    locale={activeLocale}
                    selectedStopId={undefined}
                    onReorder={handleReorderStops}
                    onEdit={handleSelectStop}
                    onDelete={deleteStop}
                    onAdd={async () => {
                      const newStop = await addStop()
                      if (newStop) {
                        router.push(`/guides/${guide.nanoId}/stops/${newStop.id}/edit`)
                      }
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Back to Guide Button */}
                <Button variant="ghost" size="sm" onClick={() => handleSelectStop(null)} className="gap-1">
                  <ArrowLeft className="h-4 w-4" />
                  {t('editor.backToGuide')}
                </Button>

                {/* Locale Tabs */}
                <LocaleTabs value={activeLocale} onValueChange={setActiveLocale} />

                {/* Stop Editor */}
                <StopEditor
                  stop={selectedStop}
                  locale={activeLocale}
                  organizationId={organizationId}
                  onSave={(data) => {
                    updateStopTranslationData(selectedStop.id, activeLocale, data)
                  }}
                  onCancel={() => handleSelectStop(null)}
                  onImageChange={async (assets) => {
                    for (const asset of assets) {
                      await attachAssetToStop(selectedStop.id, asset.id, 'image', activeLocale)
                    }
                  }}
                  onAudioChange={async (asset) => {
                    if (asset) {
                      await attachAssetToStop(selectedStop.id, asset.id, 'audio', activeLocale)
                    }
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Progress (hidden on mobile, visible on lg+) */}
        {!selectedStop && (
          <div className="hidden w-80 shrink-0 border-l bg-background p-6 lg:block">
            <h3 className="mb-4 text-base font-semibold">{t('editor.guideProgress')}</h3>
            <GuideProgress guide={guide} locale={activeLocale} />
          </div>
        )}

        {/* Right Sidebar - Stop Progress (hidden on mobile, visible on lg+) */}
        {selectedStop && (
          <div className="hidden w-80 shrink-0 border-l bg-background p-6 lg:block">
            <h3 className="mb-4 text-base font-semibold">{t('editor.stopProgress')}</h3>
            {/* TODO: Add stop-specific progress */}
          </div>
        )}
      </div>
    </div>
  )
}

export function GuideEditorClient({ guide, initialStopId }: GuideEditorClientProps) {
  return (
    <GuideEditorProvider initialGuide={guide} initialStopId={initialStopId}>
      <GuideEditorContent />
    </GuideEditorProvider>
  )
}
