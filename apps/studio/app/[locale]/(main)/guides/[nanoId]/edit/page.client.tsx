'use client'

import type { Asset } from '@valguide/core/features/assets/schema'
import { PublishTranslationButton } from '@valguide/core/features/guides/components/publish-translation-button'
import { VersionHistoryDialog } from '@valguide/core/features/guides/components/version-history-dialog'
import type { GuideWithStops } from '@valguide/core/features/guides/schema'
import { Link, useRouter } from '@valguide/i18n/routing'
import { Button } from '@valguide/ui/components/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@valguide/ui/components/sheet'
import { ArrowLeft, ChevronRight, ListChecks } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { toast } from 'sonner'
import { AssetPickerModal } from '@/features/assets/components/asset-picker-modal'
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

  const [showAssetPicker, setShowAssetPicker] = useState(false)
  const [assetPickerType, setAssetPickerType] = useState<'image' | 'audio' | 'video'>('image')
  const [assetPickerMultiple, setAssetPickerMultiple] = useState(false)
  const [assetPickerCallback, setAssetPickerCallback] = useState<((assets: Asset[]) => void) | null>(null)

  const { data: sidebarData } = useSidebarData()
  const organizationId = sidebarData?.currentTeam?.id ?? ''

  // Auto-save
  useAutoSave(save, isDirty)

  const currentTranslation = guide.translations.find((t) => t.locale === activeLocale)

  const handleSelectCoverImage = () => {
    setAssetPickerType('image')
    setAssetPickerMultiple(false)
    setAssetPickerCallback(() => (assets: Asset[]) => {
      if (assets[0]) {
        updateCoverImage(assets[0].publicUrl ?? assets[0].id)
        toast.success(t('editor.coverImageUpdated'))
      }
    })
    setShowAssetPicker(true)
  }

  const handleAssetSelect = (assets: Asset[]) => {
    if (assetPickerCallback) {
      assetPickerCallback(assets)
    }
    setShowAssetPicker(false)
    setAssetPickerCallback(null)
  }

  const handleReorderStops = (updates: Array<{ id: string; order: number }>) => {
    const reordered = [...guide.stops]
    updates.forEach(({ id, order }) => {
      const stop = reordered.find((s) => s.id === id)
      if (stop) stop.order = order
    })
    reorderStops(reordered.sort((a, b) => a.order - b.order))
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
                  onTranslationChange={(data) => {
                    updateGuideTranslationData(activeLocale, data)
                  }}
                  onCoverImageChange={(url) => {
                    updateCoverImage(url)
                  }}
                  onSelectCoverImage={handleSelectCoverImage}
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
                  onSave={(data) => {
                    updateStopTranslationData(selectedStop.id, activeLocale, data)
                  }}
                  onCancel={() => handleSelectStop(null)}
                  onSelectImages={() => {
                    setAssetPickerType('image')
                    setAssetPickerMultiple(true)
                    setAssetPickerCallback(() => async (assets: Asset[]) => {
                      for (const asset of assets) {
                        await attachAssetToStop(selectedStop.id, asset.id, 'image', activeLocale)
                      }
                    })
                    setShowAssetPicker(true)
                  }}
                  onSelectAudio={() => {
                    setAssetPickerType('audio')
                    setAssetPickerMultiple(false)
                    setAssetPickerCallback(() => async (assets: Asset[]) => {
                      if (assets[0]) {
                        await attachAssetToStop(selectedStop.id, assets[0].id, 'audio', activeLocale)
                      }
                    })
                    setShowAssetPicker(true)
                  }}
                  onSelectVideo={() => {
                    setAssetPickerType('video')
                    setAssetPickerMultiple(false)
                    setAssetPickerCallback(() => async (assets: Asset[]) => {
                      if (assets[0]) {
                        await attachAssetToStop(selectedStop.id, assets[0].id, 'video', activeLocale)
                      }
                    })
                    setShowAssetPicker(true)
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

      {/* Asset Picker Modal */}
      <AssetPickerModal
        open={showAssetPicker}
        onOpenChange={setShowAssetPicker}
        type={assetPickerType}
        locale={assetPickerType !== 'image' ? activeLocale : undefined}
        organizationId={organizationId}
        multiple={assetPickerMultiple}
        onSelect={handleAssetSelect}
      />
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
