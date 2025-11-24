'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@valguide/ui/components/button'
import { Save, ArrowLeft, Check } from 'lucide-react'
import { LocaleTabs } from '@/features/guides/components/locale-tabs'
import { GuideMetadataForm } from '@/features/guides/components/guide-metadata-form'
import { StopsList } from '@/features/guides/components/stops-list'
import { StopEditor } from '@/features/guides/components/stop-editor'
import { GuideProgress } from '@/features/guides/components/guide-progress'
import { AssetPickerModal } from '@/features/assets/components/asset-picker-modal'
import { PublishTranslationButton } from '@valguide/core/features/guides/components/publish-translation-button'
import { VersionHistoryDialog } from '@valguide/core/features/guides/components/version-history-dialog'
import { TranslationStatusBadge } from '@valguide/core/features/guides/components/translation-status-badge'
import { GuideEditorProvider, useGuideEditor } from '@/features/guides/contexts/guide-editor-context'
import { useAutoSave } from '@/features/guides/hooks/use-auto-save'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@valguide/ui/components/card'
import type { GuideWithStops } from '@valguide/core/features/guides/schema'
import type { Asset } from '@valguide/core/features/assets/schema'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'

export type GuideEditorClientProps = {
  guide: GuideWithStops
  userId: string
}

function GuideEditorContent() {
  const router = useRouter()
  const t = useTranslations('guides')
  const {
    guide,
    activeLocale,
    selectedStop,
    isDirty,
    isSaving,
    lastSaved,
    updateGuideTranslationData,
    updateCoverImage,
    selectStop,
    addStop,
    deleteStop,
    reorderStops,
    updateStopTranslationData,
    attachAssetToStop,
    detachAssetFromStop,
    setActiveLocale,
    save,
    publish,
  } = useGuideEditor()

  const backUrl = `/guides/${guide.nanoId}`

  const [showAssetPicker, setShowAssetPicker] = useState(false)
  const [assetPickerType, setAssetPickerType] = useState<'image' | 'audio' | 'video'>('image')
  const [assetPickerMultiple, setAssetPickerMultiple] = useState(false)
  const [assetPickerCallback, setAssetPickerCallback] = useState<((assets: Asset[]) => void) | null>(null)
  const organizationId = '00000000-0000-0000-0000-000000000123' // TODO: Get from user context

  // Auto-save
  useAutoSave(save, isDirty)

  const currentTranslation = guide.translations.find((t) => t.locale === activeLocale)

  const handleSelectCoverImage = () => {
    setAssetPickerType('image')
    setAssetPickerMultiple(false)
    setAssetPickerCallback(() => (assets: Asset[]) => {
      if (assets[0]) {
        updateCoverImage(assets[0].id)
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
      <div className="flex items-center justify-between border-b bg-white px-6 py-3">
        <div className="flex items-center gap-3">
          <Link href={backUrl}>
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              Guides
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
            Preview
          </Button>
          <Button onClick={save} disabled={isSaving || !isDirty} size="sm">
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Center Panel - Guide/Stop Editor */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="mx-auto max-w-4xl p-8">
            {!selectedStop ? (
              <div className="space-y-6">
                {/* Guide Details Header */}
                <div>
                  <h2 className="mb-4 text-lg font-semibold">Guide Details</h2>
                  
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
                    if (url) updateCoverImage(url)
                  }}
                  onSelectCoverImage={handleSelectCoverImage}
                />

                {/* Stops Section */}
                <div>
                  <h3 className="mb-4 text-base font-medium">Stops</h3>
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
                  Guide
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
          <div className="w-80 border-l bg-white p-6">
            <h3 className="mb-4 text-base font-semibold">Guide Progress</h3>
            <GuideProgress guide={guide} locale={activeLocale} />
          </div>
        )}

        {/* Right Sidebar - Stop Progress */}
        {selectedStop && (
          <div className="w-80 border-l bg-white p-6">
            <h3 className="mb-4 text-base font-semibold">Stop Progress</h3>
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

export function GuideEditorClient({ guide, userId }: GuideEditorClientProps) {
  return (
    <GuideEditorProvider initialGuide={guide} userId={userId}>
      <GuideEditorContent />
    </GuideEditorProvider>
  )
}
