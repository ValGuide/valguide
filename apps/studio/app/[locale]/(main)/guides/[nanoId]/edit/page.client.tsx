'use client'

import type { Asset } from '@valguide/core/features/assets/schema'
import { VersionHistoryDialog } from '@valguide/core/features/guides/components/version-history-dialog'
import type { GuideWithStops } from '@valguide/core/features/guides/schema'
import { Link, useRouter } from '@valguide/i18n/routing'
import { Button } from '@valguide/ui/components/button'
import { ArrowLeft } from 'lucide-react'
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

  const backUrl = `/guides/${guide.nanoId}`

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
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-background px-6 py-3">
        <div className="flex items-center gap-3">
          <Link href={backUrl}>
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              {t('title')}
            </Button>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <VersionHistoryDialog
            guideId={guide.id}
            locale={activeLocale}
            onRollback={() => {
              router.refresh()
            }}
          />
          <Button variant="ghost" size="sm">
            {t('editor.preview')}
          </Button>
          <Button onClick={save} disabled={isSaving || !isDirty} size="sm">
            {isSaving ? t('editor.saving') : t('editor.save')}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Center Panel - Guide/Stop Editor */}
        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-background">
          <div className="mx-auto max-w-4xl p-8">
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
                    onEdit={selectStop}
                    onDelete={deleteStop}
                    onAdd={addStop}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Back to Guide Button */}
                <Button variant="ghost" size="sm" onClick={() => selectStop(null)} className="gap-1">
                  <ArrowLeft className="h-4 w-4" />
                  {t('title')}
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
                  onCancel={() => selectStop(null)}
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

        {/* Right Sidebar - Progress */}
        {!selectedStop && (
          <div className="w-80 border-l bg-background p-6">
            <h3 className="mb-4 text-base font-semibold">{t('editor.guideProgress')}</h3>
            <GuideProgress guide={guide} locale={activeLocale} />
          </div>
        )}

        {/* Right Sidebar - Stop Progress */}
        {selectedStop && (
          <div className="w-80 border-l bg-background p-6">
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

export function GuideEditorClient({ guide }: GuideEditorClientProps) {
  return (
    <GuideEditorProvider initialGuide={guide}>
      <GuideEditorContent />
    </GuideEditorProvider>
  )
}
