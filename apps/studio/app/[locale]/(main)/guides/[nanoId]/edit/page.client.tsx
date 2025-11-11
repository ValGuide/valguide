'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { Button } from '@valguide/ui/components/button'
import { Save, ArrowLeft } from 'lucide-react'
import { LocaleTabs } from '@/features/guides/components/locale-tabs'
import { GuideMetadataForm } from '@/features/guides/components/guide-metadata-form'
import { StopsList } from '@/features/guides/components/stops-list'
import { StopEditor } from '@/features/guides/components/stop-editor'
import { AssetPickerModal } from '@/features/assets/components/asset-picker-modal'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@valguide/ui/components/dialog'
import type { GuideWithTranslations, StopWithTranslations, Stop } from '@valguide/core/features/guides/schema'
import type { SupportedLocale } from '@valguide/i18n/i18n.config'
import type { Asset } from '@valguide/core/features/assets/schema'
import { toast } from 'sonner'

export type GuideEditorClientProps = {
  guide: GuideWithTranslations
}

export function GuideEditorClient({ guide }: GuideEditorClientProps) {
  const t = useTranslations('guides')
  const router = useRouter()
  const [activeLocale, setActiveLocale] = useState<SupportedLocale>('en')
  const [isSaving, setIsSaving] = useState(false)
  const [translations, setTranslations] = useState(guide.translations)
  const [coverImage, setCoverImage] = useState(guide.coverImage)
  const [stops, setStops] = useState<StopWithTranslations[]>([])
  const [editingStop, setEditingStop] = useState<Stop | null>(null)
  const [showStopEditor, setShowStopEditor] = useState(false)
  const [showAssetPicker, setShowAssetPicker] = useState(false)
  const [assetPickerType, setAssetPickerType] = useState<'image' | 'audio' | 'video'>('image')
  const [assetPickerMultiple, setAssetPickerMultiple] = useState(false)
  const organizationId = 'org-123' // TODO: Get from user context

  const currentTranslation = translations.find((t) => t.locale === activeLocale)

  const handleTranslationChange = (data: { title: string; description: string }) => {
    setTranslations((prev) => {
      const existing = prev.find((t) => t.locale === activeLocale)
      if (existing) {
        return prev.map((t) => (t.locale === activeLocale ? { ...t, ...data } : t))
      } else {
        return [
          ...prev,
          {
            id: crypto.randomUUID(),
            guideId: guide.id,
            locale: activeLocale,
            title: data.title,
            description: data.description,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]
      }
    })
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      // TODO: Implement save to API
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success('Guide saved', {
        description: 'Your changes have been saved successfully',
      })
    } catch (error) {
      toast.error('Failed to save', {
        description: error instanceof Error ? error.message : 'An error occurred',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSelectCoverImage = () => {
    setAssetPickerType('image')
    setAssetPickerMultiple(false)
    setShowAssetPicker(true)
  }

  const handleAssetSelect = (assets: Asset[]) => {
    if (assetPickerType === 'image' && !assetPickerMultiple && assets[0]) {
      setCoverImage(assets[0].publicUrl)
      toast.success('Cover image updated')
    }
    setShowAssetPicker(false)
  }

  const handleAddStop = () => {
    setEditingStop(null)
    setShowStopEditor(true)
  }

  const handleEditStop = (stop: Stop) => {
    setEditingStop(stop)
    setShowStopEditor(true)
  }

  const handleDeleteStop = async (stopId: string) => {
    // TODO: API call to delete stop
    setStops((prev) => prev.filter((s) => s.id !== stopId))
    toast.success('Stop deleted')
  }

  const handleReorderStops = (updates: Array<{ id: string; order: number }>) => {
    // TODO: API call to update order
    setStops((prev) => {
      const updated = [...prev]
      updates.forEach(({ id, order }) => {
        const stop = updated.find((s) => s.id === id)
        if (stop) stop.order = order
      })
      return updated.sort((a, b) => a.order - b.order)
    })
  }

  const handleSaveStop = (data: { title: string; description: string; transcription: string }) => {
    // TODO: API call to create/update stop
    toast.success('Stop saved')
    setShowStopEditor(false)
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/guides/${guide.nanoId}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Edit Guide</h1>
            <p className="text-sm text-muted-foreground">{guide.nanoId}</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Locale Tabs */}
      <LocaleTabs value={activeLocale} onValueChange={setActiveLocale} />

      {/* Guide Metadata Form */}
      <GuideMetadataForm
        locale={activeLocale}
        translation={currentTranslation}
        coverImage={coverImage}
        onTranslationChange={handleTranslationChange}
        onCoverImageChange={setCoverImage}
        onSelectCoverImage={handleSelectCoverImage}
      />

      {/* Stops List */}
      <StopsList
        stops={stops}
        locale={activeLocale}
        onReorder={handleReorderStops}
        onEdit={handleEditStop}
        onDelete={handleDeleteStop}
        onAdd={handleAddStop}
      />

      {/* Stop Editor Dialog */}
      <Dialog open={showStopEditor} onOpenChange={setShowStopEditor}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingStop ? 'Edit Stop' : 'New Stop'}</DialogTitle>
          </DialogHeader>
          <StopEditor
            stop={editingStop ? (stops.find((s) => s.id === editingStop.id) as StopWithTranslations) : undefined}
            locale={activeLocale}
            onSave={handleSaveStop}
            onCancel={() => setShowStopEditor(false)}
            onSelectImages={() => {
              setAssetPickerType('image')
              setAssetPickerMultiple(true)
              setShowAssetPicker(true)
            }}
            onSelectAudio={() => {
              setAssetPickerType('audio')
              setAssetPickerMultiple(false)
              setShowAssetPicker(true)
            }}
            onSelectVideo={() => {
              setAssetPickerType('video')
              setAssetPickerMultiple(false)
              setShowAssetPicker(true)
            }}
          />
        </DialogContent>
      </Dialog>

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
