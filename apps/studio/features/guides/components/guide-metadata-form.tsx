'use client'

import type { Asset } from '@valguide/core/features/assets/schema'
import { RichTextEditor } from '@valguide/core/features/guides/rich-text-editor'
import type { GuideTranslationWithVersion } from '@valguide/core/features/guides/schema'
import { getVersionedField } from '@valguide/core/features/guides/utils'
import type { SupportedLocale } from '@valguide/i18n/i18n.config'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@valguide/ui/components/card'
import { Input } from '@valguide/ui/components/input'
import { Label } from '@valguide/ui/components/label'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useState } from 'react'
import { MediaPicker } from '@/features/assets/components/media-picker/media-picker'

export type GuideMetadataFormProps = {
  locale: SupportedLocale
  translation?: GuideTranslationWithVersion
  coverImage?: string | null
  organizationId: string
  onTranslationChange: (data: { title: string; description: string }) => void
  onCoverImageChange?: (url: string | null) => void
}

export function GuideMetadataForm({
  locale,
  translation,
  coverImage,
  organizationId,
  onTranslationChange,
  onCoverImageChange,
}: GuideMetadataFormProps) {
  const t = useTranslations('guides')
  const [title, setTitle] = useState(getVersionedField(translation, 'title', true))
  const [description, setDescription] = useState(getVersionedField(translation, 'description', true))

  useEffect(() => {
    setTitle(getVersionedField(translation, 'title', true))
    setDescription(getVersionedField(translation, 'description', true))
  }, [translation])

  const handleTitleChange = (value: string) => {
    setTitle(value)
    onTranslationChange({ title: value, description })
  }

  const handleDescriptionChange = (value: string) => {
    setDescription(value)
    onTranslationChange({ title, description: value })
  }

  const coverImageAsset: Asset | null = useMemo(() => {
    if (!coverImage) return null
    return {
      id: 'cover-image',
      nanoId: 'cover',
      fileName: 'Cover Image',
      fileSize: 0,
      mimeType: 'image/jpeg',
      type: 'image',
      storagePath: '',
      publicUrl: coverImage,
      locale: null,
      width: null,
      height: null,
      duration: null,
      organizationId: organizationId,
      uploadedBy: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  }, [coverImage, organizationId])

  const handleCoverImageChange = (value: Asset | Asset[] | null) => {
    if (value === null) {
      onCoverImageChange?.(null)
    } else if (!Array.isArray(value)) {
      onCoverImageChange?.(value.publicUrl ?? null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {t('editor.guideDetails')}{' '}
          <span className="ml-2 text-sm font-normal uppercase text-muted-foreground">
            {t('editor.localeIndicator', { locale })}
          </span>
        </CardTitle>
        <CardDescription>{t('editor.guideDetailsDescription')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor={`title-${locale}`}>{t('editor.titleLabel')}</Label>
          <Input
            id={`title-${locale}`}
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder={t('editor.titlePlaceholder')}
            maxLength={500}
            required
          />
          <p className="text-xs text-muted-foreground">{t('editor.characterCount', { current: title.length })}</p>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor={`description-${locale}`}>{t('editor.descriptionLabel')}</Label>
          <RichTextEditor
            value={description}
            onChange={handleDescriptionChange}
            placeholder={t('editor.descriptionPlaceholder')}
          />
        </div>

        {/* Cover Image */}
        <MediaPicker
          mode="single"
          mediaTypes={['image']}
          value={coverImageAsset}
          onChange={handleCoverImageChange}
          label={t('editor.coverImageLabel')}
          organizationId={organizationId}
        />
      </CardContent>
    </Card>
  )
}
