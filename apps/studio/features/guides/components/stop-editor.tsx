'use client'

import type { StopWithTranslations } from '@valguide/core/features/guides/schema'
import type { SupportedLocale } from '@valguide/i18n/i18n.config'
import { Badge } from '@valguide/ui/components/badge'
import { Button } from '@valguide/ui/components/button'
import { Input } from '@valguide/ui/components/input'
import { Label } from '@valguide/ui/components/label'
import { Textarea } from '@valguide/ui/components/textarea'
import { Image as ImageIcon, Mic, Music, Plus, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

export type StopEditorProps = {
  stop?: StopWithTranslations
  locale: SupportedLocale
  onSave: (data: { title: string; description: string; transcription: string }) => void
  onCancel: () => void
  onSelectImages?: () => void
  onSelectAudio?: () => void
  onSelectVideo?: () => void
}

type MediaItem = {
  id: string
  url: string
  locale?: SupportedLocale
}

export function StopEditor({
  stop,
  locale,
  onSave,
  onCancel,
  onSelectImages,
  _onSelectAudio,
  _onSelectVideo,
}: StopEditorProps) {
  const t = useTranslations('stops.editor')
  const tActions = useTranslations('stops.actions')

  const translation = stop?.translations.find((t) => t.locale === locale)
  const [title, setTitle] = useState(translation?.currentVersion?.title ?? translation?.draftVersion?.title ?? '')
  const [description, setDescription] = useState(
    translation?.currentVersion?.description ?? translation?.draftVersion?.description ?? '',
  )
  const [transcription, setTranscription] = useState(
    translation?.currentVersion?.transcription ?? translation?.draftVersion?.transcription ?? '',
  )

  const [images, setImages] = useState<MediaItem[]>([])
  const [audio, setAudio] = useState<MediaItem | null>(null)
  const [video, setVideo] = useState<MediaItem | null>(null)

  useEffect(() => {
    setTitle(translation?.currentVersion?.title ?? translation?.draftVersion?.title ?? '')
    setDescription(translation?.currentVersion?.description ?? translation?.draftVersion?.description ?? '')
    setTranscription(translation?.currentVersion?.transcription ?? translation?.draftVersion?.transcription ?? '')
  }, [translation])

  const handleSave = () => {
    onSave({ title, description, transcription })
  }

  const handleRemoveImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor={`stop-title-${locale}`} className="text-sm font-medium">
          Stop Title
        </Label>
        <Input
          id={`stop-title-${locale}`}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t('titlePlaceholder')}
          maxLength={500}
          required
          className="bg-gray-100"
        />
      </div>

      {/* Audio */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Audio</Label>
        {audio ? (
          <div className="flex items-center justify-between rounded-lg border bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-100">
                <Music className="h-5 w-5" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Audio file</span>
                {audio.locale && (
                  <Badge variant="secondary" className="uppercase">
                    {audio.locale}
                  </Badge>
                )}
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setAudio(null)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-white p-12">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <Music className="h-6 w-6 text-gray-600" />
            </div>
            <p className="mb-1 text-sm font-medium">Click to upload or drag and drop</p>
            <p className="mb-4 text-xs text-muted-foreground">MP3 files up to 50MB</p>
          </div>
        )}
        <Button variant="link" size="sm" className="px-0 text-sm">
          Browse Asset Library...
        </Button>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor={`stop-description-${locale}`} className="text-sm font-medium">
            Description
          </Label>
          <Button variant="ghost" size="sm" className="gap-1">
            <Mic className="h-4 w-4" />
            Auto-generate from audio
          </Button>
        </div>
        <div className="rounded-lg border bg-white p-3">
          <div className="mb-2 flex gap-1">
            <Button variant="ghost" size="sm" className="h-8 px-2">
              <span className="font-semibold">B</span>
            </Button>
            <Button variant="ghost" size="sm" className="h-8 px-2">
              <span className="italic">I</span>
            </Button>
            <Button variant="ghost" size="sm" className="h-8 px-2">
              • List
            </Button>
          </div>
          <Textarea
            id={`stop-description-${locale}`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('descriptionPlaceholder')}
            rows={4}
            className="border-0 p-0 focus-visible:ring-0"
          />
        </div>
      </div>

      {/* Gallery */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Gallery (Images & Video)</Label>
        {images.length > 0 || video ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {images.map((image) => (
              <div key={image.id} className="relative aspect-square overflow-hidden rounded-lg border bg-white">
                {/* biome-ignore lint/performance/noImgElement: Using img for dynamic content */}
                <img src={image.url} alt="" className="h-full w-full object-cover" />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute right-2 top-2 h-8 w-8"
                  onClick={() => handleRemoveImage(image.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {video && (
              <div className="relative aspect-square overflow-hidden rounded-lg border bg-white">
                <video src={video.url} className="h-full w-full object-cover" controls />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute right-2 top-2 h-8 w-8"
                  onClick={() => setVideo(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            <Button variant="outline" onClick={onSelectImages} className="aspect-square h-full w-full border-dashed">
              <Plus className="h-6 w-6" />
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-white p-12">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <ImageIcon className="h-6 w-6 text-gray-600" />
            </div>
            <p className="mb-1 text-sm font-medium">Click to upload or drag and drop</p>
            <p className="mb-4 text-xs text-muted-foreground">Images and videos up to 50MB each</p>
          </div>
        )}
        <Button variant="link" size="sm" className="px-0 text-sm">
          Browse Asset Library...
        </Button>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 border-t pt-6">
        <Button variant="outline" onClick={onCancel}>
          {tActions('cancel')}
        </Button>
        <Button onClick={handleSave}>{tActions('save')}</Button>
      </div>
    </div>
  )
}
