'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Input } from '@valguide/ui/components/input'
import { Label } from '@valguide/ui/components/label'
import { Textarea } from '@valguide/ui/components/textarea'
import { Button } from '@valguide/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@valguide/ui/components/card'
import { Badge } from '@valguide/ui/components/badge'
import { Image as ImageIcon, Music, Video, Mic, X, Plus } from 'lucide-react'
import type { SupportedLocale } from '@valguide/i18n/i18n.config'
import type { StopWithTranslations } from '@valguide/core/features/guides/schema'

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
  onSelectAudio,
  onSelectVideo,
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
  }, [locale, translation])

  const handleSave = () => {
    onSave({ title, description, transcription })
  }

  const handleRemoveImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id))
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle>
              {t('title')} <span className="ml-2 text-sm font-normal uppercase text-muted-foreground">({locale})</span>
            </CardTitle>
            <CardDescription>Edit the stop content for this language</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor={`stop-title-${locale}`}>{t('titleLabel')} *</Label>
          <Input
            id={`stop-title-${locale}`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('titlePlaceholder')}
            maxLength={500}
            required
          />
          <p className="text-xs text-muted-foreground">{title.length}/500 characters</p>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor={`stop-description-${locale}`}>{t('descriptionLabel')}</Label>
          <Textarea
            id={`stop-description-${locale}`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('descriptionPlaceholder')}
            rows={4}
          />
        </div>

        {/* Images */}
        <div className="space-y-2">
          <Label>{t('imagesLabel')}</Label>
          {images.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {images.map((image) => (
                <div key={image.id} className="relative aspect-square overflow-hidden rounded-lg border">
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
              <Button variant="outline" onClick={onSelectImages} className="aspect-square h-full w-full">
                <Plus className="h-6 w-6" />
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8">
              <ImageIcon className="mb-3 h-10 w-10 text-muted-foreground" />
              <p className="mb-3 text-sm text-muted-foreground">{t('noImages')}</p>
              <Button variant="outline" onClick={onSelectImages}>
                <Plus className="mr-2 h-4 w-4" />
                {t('addImage')}
              </Button>
            </div>
          )}
        </div>

        {/* Audio */}
        <div className="space-y-2">
          <Label>{t('audioLabel')}</Label>
          {audio ? (
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                  <Music className="h-5 w-5 text-primary" />
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
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8">
              <Music className="mb-3 h-10 w-10 text-muted-foreground" />
              <p className="mb-3 text-sm text-muted-foreground">{t('noAudio')}</p>
              <Button variant="outline" onClick={onSelectAudio}>
                <Plus className="mr-2 h-4 w-4" />
                {t('addAudio')}
              </Button>
            </div>
          )}
        </div>

        {/* Video */}
        <div className="space-y-2">
          <Label>{t('videoLabel')}</Label>
          {video ? (
            <div className="space-y-2">
              <div className="relative aspect-video overflow-hidden rounded-lg border">
                <video src={video.url} className="h-full w-full object-cover" controls />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute right-2 top-2"
                  onClick={() => setVideo(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {video.locale && (
                <Badge variant="secondary" className="uppercase">
                  {video.locale}
                </Badge>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8">
              <Video className="mb-3 h-10 w-10 text-muted-foreground" />
              <p className="mb-3 text-sm text-muted-foreground">{t('noVideo')}</p>
              <Button variant="outline" onClick={onSelectVideo}>
                <Plus className="mr-2 h-4 w-4" />
                {t('addVideo')}
              </Button>
            </div>
          )}
        </div>

        {/* Transcription */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor={`stop-transcription-${locale}`}>{t('transcriptionLabel')}</Label>
            <Button variant="ghost" size="sm" disabled>
              <Mic className="mr-2 h-4 w-4" />
              {t('autoTranscribe')}
            </Button>
          </div>
          <Textarea
            id={`stop-transcription-${locale}`}
            value={transcription}
            onChange={(e) => setTranscription(e.target.value)}
            placeholder={t('transcriptionPlaceholder')}
            rows={6}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onCancel}>
            {tActions('cancel')}
          </Button>
          <Button onClick={handleSave} disabled={!title.trim()}>
            {tActions('save')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
