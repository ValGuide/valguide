'use client'

import type { Asset } from '@valguide/core/features/assets/schema'
import { TranslationStatusBadge } from '@valguide/core/features/guides/components/translation-status-badge'
import { RichTextEditor } from '@valguide/core/features/guides/rich-text-editor'
import type { StopWithTranslations } from '@valguide/core/features/guides/schema'
import type { SupportedLocale } from '@valguide/i18n/i18n.config'
import { Button } from '@valguide/ui/components/button'
import { Input } from '@valguide/ui/components/input'
import { Label } from '@valguide/ui/components/label'
import { Mic } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'
import { MediaPicker } from '@/features/assets/components/media-picker/media-picker'

export type StopEditorProps = {
  stop?: StopWithTranslations
  locale: SupportedLocale
  organizationId: string
  onChange?: (data: { title: string; description: string; transcription: string }) => void
  onImageChange?: (assets: Asset[]) => void
  onAudioChange?: (asset: Asset | null) => void
  images?: Asset[]
  audio?: Asset | null
}

export function StopEditor({
  stop,
  locale,
  organizationId,
  onChange,
  onImageChange,
  onAudioChange,
  images = [],
  audio = null,
}: StopEditorProps) {
  const t = useTranslations('stops.editor')

  const translation = stop?.translations.find((t) => t.locale === locale)
  const [title, setTitle] = useState(translation?.currentVersion?.title ?? translation?.draftVersion?.title ?? '')
  const [description, setDescription] = useState(
    translation?.currentVersion?.description ?? translation?.draftVersion?.description ?? '',
  )
  const [transcription, setTranscription] = useState(
    translation?.currentVersion?.transcription ?? translation?.draftVersion?.transcription ?? '',
  )

  const hasDraft = !!translation?.draftVersionId
  const publishedStatus = translation?.currentVersion?.status

  const isExternalUpdate = useRef(false)

  useEffect(() => {
    isExternalUpdate.current = true
    setTitle(translation?.currentVersion?.title ?? translation?.draftVersion?.title ?? '')
    setDescription(translation?.currentVersion?.description ?? translation?.draftVersion?.description ?? '')
    setTranscription(translation?.currentVersion?.transcription ?? translation?.draftVersion?.transcription ?? '')
  }, [translation])

  useEffect(() => {
    if (isExternalUpdate.current) {
      isExternalUpdate.current = false
      return
    }
    onChange?.({ title, description, transcription })
  }, [title, description, transcription, onChange])

  const handleImagesChange = (value: Asset | Asset[] | null) => {
    if (Array.isArray(value)) {
      onImageChange?.(value)
    } else if (value === null) {
      onImageChange?.([])
    }
  }

  const handleAudioChange = (value: Asset | Asset[] | null) => {
    if (value === null || (!Array.isArray(value) && value)) {
      onAudioChange?.(value as Asset | null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor={`stop-title-${locale}`} className="text-sm font-medium">
            {t('titleLabel')}
          </Label>
          <TranslationStatusBadge status={publishedStatus} hasDraft={hasDraft} />
        </div>
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
      <MediaPicker
        mode="single"
        mediaTypes={['audio']}
        value={audio}
        onChange={handleAudioChange}
        label={t('audioLabel')}
        organizationId={organizationId}
        locale={locale}
      />

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
        <RichTextEditor value={description} onChange={setDescription} placeholder={t('descriptionPlaceholder')} />
      </div>

      {/* Gallery */}
      <MediaPicker
        mode="multiple"
        mediaTypes={['image', 'video']}
        value={images}
        onChange={handleImagesChange}
        label={t('galleryLabel')}
        organizationId={organizationId}
      />

    </div>
  )
}
