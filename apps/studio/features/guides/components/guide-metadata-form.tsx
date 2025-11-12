'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Input } from '@valguide/ui/components/input'
import { Label } from '@valguide/ui/components/label'
import { RichTextEditor } from '@valguide/core/features/guides/rich-text-editor'
import { Button } from '@valguide/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@valguide/ui/components/card'
import { Image as ImageIcon, X } from 'lucide-react'
import type { SupportedLocale } from '@valguide/i18n/i18n.config'
import type { GuideTranslation } from '@valguide/core/features/guides/schema'

export type GuideMetadataFormProps = {
  locale: SupportedLocale
  translation?: GuideTranslation
  coverImage?: string | null
  onTranslationChange: (data: { title: string; description: string }) => void
  onCoverImageChange?: (url: string | null) => void
  onSelectCoverImage?: () => void
}

export function GuideMetadataForm({
  locale,
  translation,
  coverImage,
  onTranslationChange,
  onCoverImageChange,
  onSelectCoverImage,
}: GuideMetadataFormProps) {
  const t = useTranslations('guides')
  const [title, setTitle] = useState(translation?.title || '')
  const [description, setDescription] = useState(translation?.description || '')

  useEffect(() => {
    setTitle(translation?.title || '')
    setDescription(translation?.description || '')
  }, [locale, translation])

  const handleTitleChange = (value: string) => {
    setTitle(value)
    onTranslationChange({ title: value, description })
  }

  const handleDescriptionChange = (value: string) => {
    setDescription(value)
    onTranslationChange({ title, description: value })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Guide Details <span className="ml-2 text-sm font-normal uppercase text-muted-foreground">({locale})</span>
        </CardTitle>
        <CardDescription>Edit the guide information for this language</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor={`title-${locale}`}>Title *</Label>
          <Input
            id={`title-${locale}`}
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Enter guide title"
            maxLength={500}
            required
          />
          <p className="text-xs text-muted-foreground">{title.length}/500 characters</p>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor={`description-${locale}`}>Description</Label>
          <RichTextEditor
            value={description}
            onChange={handleDescriptionChange}
            placeholder="Enter guide description"
          />
        </div>

        {/* Cover Image */}
        <div className="space-y-2">
          <Label>Cover Image</Label>
          {coverImage ? (
            <div className="relative">
              <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                <img src={coverImage} alt="Cover" className="h-full w-full object-cover" />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute right-2 top-2"
                  onClick={() => onCoverImageChange?.(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="outline" onClick={onSelectCoverImage} className="w-full">
              <ImageIcon className="mr-2 h-4 w-4" />
              Select Cover Image
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
