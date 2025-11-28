'use client'

import { RichTextEditor } from '@valguide/core/features/guides/rich-text-editor'
import type { StopWithTranslations } from '@valguide/core/features/guides/schema'
import type { SupportedLocale } from '@valguide/i18n/i18n.config'
import { Badge } from '@valguide/ui/components/badge'
import { Button } from '@valguide/ui/components/button'
import { Input } from '@valguide/ui/components/input'
import { Label } from '@valguide/ui/components/label'
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

export function StopEditor({ stop, locale, onSave, onCancel, onSelectImages }: StopEditorProps) {
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
          {t('titleLabel')}
        </Label>
        <Input
          id={`stop-title-${locale}`}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t('titlePlaceholder')}
          maxLength={500}
          required
          className="bg-muted"
        />
      </div>

      {/* Audio */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">{t('audioLabel')}</Label>
        {audio ? (
          <div className="flex items-center justify-between rounded-lg border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                <Music className="h-5 w-5" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{t('audioFile')}</span>
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
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-card p-12">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Music className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="mb-1 text-sm font-medium">{t('dropzoneText')}</p>
            <p className="mb-4 text-xs text-muted-foreground">{t('audioHint')}</p>
          </div>
        )}
        <Button variant="link" size="sm" className="px-0 text-sm">
          {t('browseLibrary')}
        </Button>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor={`stop-description-${locale}`} className="text-sm font-medium">
            {t('descriptionLabel')}
          </Label>
          <Button variant="ghost" size="sm" className="gap-1">
            <Mic className="h-4 w-4" />
            {t('autoGenerate')}
          </Button>
        </div>
        <RichTextEditor
          value={description}
          onChange={setDescription}
          placeholder={t('descriptionPlaceholder')}
        />
      </div>

      {/* Gallery */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">{t('galleryLabel')}</Label>
        {images.length > 0 || video ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {images.map((image) => (
              <div key={image.id} className="relative aspect-square overflow-hidden rounded-lg border bg-card">
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
              <div className="relative aspect-square overflow-hidden rounded-lg border bg-card">
                {/* biome-ignore lint/a11y/useMediaCaption: captions not available for user-uploaded content */}
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
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-card p-12">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <ImageIcon className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="mb-1 text-sm font-medium">{t('dropzoneText')}</p>
            <p className="mb-4 text-xs text-muted-foreground">{t('galleryHint')}</p>
          </div>
        )}
        <Button variant="link" size="sm" className="px-0 text-sm">
          {t('browseLibrary')}
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
