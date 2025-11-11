'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { Button } from '@valguide/ui/components/button'
import { Save, ArrowLeft, Check } from 'lucide-react'
import { LocaleTabs } from '@/features/guides/components/locale-tabs'
import { GuideMetadataForm } from '@/features/guides/components/guide-metadata-form'
import { StopsList } from '@/features/guides/components/stops-list'
import { StopEditor } from '@/features/guides/components/stop-editor'
import { GuideProgress } from '@/features/guides/components/guide-progress'
import { AssetPickerModal } from '@/features/assets/components/asset-picker-modal'
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
    publish
  } = useGuideEditor()

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
        toast.success('Cover image updated')
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
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href="/guides">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {currentTranslation?.title || 'Untitled Guide'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {lastSaved ? `Saved ${formatDistanceToNow(lastSaved, { addSuffix: true })}` : 'Not saved yet'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={save} disabled={isSaving || !isDirty} variant="outline">
            {isSaving ? (
              'Saving...'
            ) : isDirty ? (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Saved
              </>
            )}
          </Button>
          <Button onClick={publish} disabled={isSaving}>
            Publish
          </Button>
        </div>
      </div>

      {/* Locale Tabs */}
      <div className="border-b px-6">
        <LocaleTabs value={activeLocale} onValueChange={setActiveLocale} />
      </div>

      {/* Split Panel Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Stops List & Progress */}
        <div className="w-80 border-r bg-muted/20 overflow-y-auto">
          <div className="p-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Guide Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <GuideProgress guide={guide} locale={activeLocale} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Stops</CardTitle>
                <CardDescription>
                  {guide.stops.length} {guide.stops.length === 1 ? 'stop' : 'stops'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <StopsList
                  stops={guide.stops}
                  locale={activeLocale}
                  selectedStopId={selectedStop?.id}
                  onReorder={handleReorderStops}
                  onEdit={selectStop}
                  onDelete={deleteStop}
                  onAdd={addStop}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Panel - Guide/Stop Editor */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Guide Metadata */}
            {!selectedStop && (
              <Card>
                <CardHeader>
                  <CardTitle>Guide Information</CardTitle>
                  <CardDescription>
                    Basic information about your guide
                  </CardDescription>
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>
            )}

            {/* Stop Editor */}
            {selectedStop && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {selectedStop.translations.find((t) => t.locale === activeLocale)?.title || 'Untitled Stop'}
                  </CardTitle>
                  <CardDescription>
                    Edit stop content for {activeLocale.toUpperCase()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>
            )}

            {/* Empty state when no stop selected */}
            {!selectedStop && guide.stops.length === 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Get Started</CardTitle>
                  <CardDescription>
                    Add your first stop to begin building your guide
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={addStop} size="lg">
                    Add First Stop
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
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
