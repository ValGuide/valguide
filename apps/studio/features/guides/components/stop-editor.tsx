'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import type { Asset } from '@valguide/core/features/assets/schema'
import { TranslationStatusBadge } from '@valguide/core/features/guides/components/translation-status-badge'
import { RichTextEditor } from '@valguide/core/features/guides/rich-text-editor'
import type { StopWithTranslations } from '@valguide/core/features/guides/schema'
import { getVersionedField } from '@valguide/core/features/guides/utils'

import { Button } from '@valguide/ui/components/button'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@valguide/ui/components/form'
import { Input } from '@valguide/ui/components/input'
import { Mic } from 'lucide-react'
import { useTranslations } from '@valguide/core/i18n/mock'
import { forwardRef, useEffect, useImperativeHandle } from 'react'
import { type UseFormReturn, useForm } from 'react-hook-form'
import { MediaPicker } from '@/features/assets/components/media-picker/media-picker'
import { type StopTranslationFormData, stopTranslationFormSchema } from '../schemas/guide-form'

export type StopEditorProps = {
  stop?: StopWithTranslations
  locale: string
  organizationId: string
  onChange?: (data: StopTranslationFormData) => void
  onDirtyChange?: (isDirty: boolean) => void
  onImageChange?: (assets: Asset[]) => void
  onAudioChange?: (asset: Asset | null) => void
  onSave?: () => void
  images?: Asset[]
  audio?: Asset | null
}

export type StopEditorRef = {
  form: UseFormReturn<StopTranslationFormData>
  resetToCurrentValues: () => void
  resetToFormValues: () => void
}

export const StopEditor = forwardRef<StopEditorRef, StopEditorProps>(function StopEditor(
  {
    stop,
    locale,
    organizationId,
    onChange,
    onDirtyChange,
    onImageChange,
    onAudioChange,
    onSave,
    images = [],
    audio = null,
  },
  ref,
) {
  const t = useTranslations('stops.editor')

  const translation = stop?.translations.find((t) => t.locale === locale)
  const hasDraft = !!translation?.draftVersionId
  const publishedStatus = translation?.currentVersion?.status

  const form = useForm<StopTranslationFormData>({
    resolver: zodResolver(stopTranslationFormSchema),
    defaultValues: {
      title: getVersionedField(translation, 'title', true),
      description: getVersionedField(translation, 'description', true),
      transcription: getVersionedField(translation, 'transcription', true),
    },
  })

  const { isDirty } = form.formState

  useImperativeHandle(
    ref,
    () => ({
      form,
      resetToCurrentValues: () => {
        // Reset to fresh prop values - use after refetch when stop data changes
        form.reset({
          title: getVersionedField(translation, 'title', true),
          description: getVersionedField(translation, 'description', true),
          transcription: getVersionedField(translation, 'transcription', true),
        })
      },
      resetToFormValues: () => {
        // Reset baseline to current form values - use after save to mark form as clean
        form.reset(form.getValues())
      },
    }),
    [form, translation],
  )

  useEffect(() => {
    onDirtyChange?.(isDirty)
  }, [isDirty, onDirtyChange])

  useEffect(() => {
    const subscription = form.watch((values, { type }) => {
      // Only notify parent of changes when the user actually changes a field
      // Skip the initial mount subscription event (type is undefined on mount)
      if (type === 'change' && values.title !== undefined) {
        onChange?.({
          title: values.title ?? '',
          description: values.description ?? '',
          transcription: values.transcription ?? '',
        })
      }
    })
    return () => subscription.unsubscribe()
  }, [form, onChange])

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
    <Form {...form}>
      <form className="space-y-6 rounded-xl border bg-card p-6">
        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>{t('titleLabel')}</FormLabel>
                <TranslationStatusBadge status={publishedStatus} hasDraft={hasDraft} />
              </div>
              <FormControl>
                <Input
                  {...field}
                  placeholder={t('titlePlaceholder')}
                  maxLength={500}
                  required
                  className="bg-muted"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      onSave?.()
                    }
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />

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
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>{t('descriptionLabel')}</FormLabel>
                <Button type="button" variant="ghost" size="sm" className="gap-1">
                  <Mic className="h-4 w-4" />
                  {t('autoGenerate')}
                </Button>
              </div>
              <FormControl>
                <RichTextEditor
                  value={field.value}
                  onChange={field.onChange}
                  placeholder={t('descriptionPlaceholder')}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Gallery */}
        <MediaPicker
          mode="multiple"
          mediaTypes={['image', 'video']}
          value={images}
          onChange={handleImagesChange}
          label={t('galleryLabel')}
          organizationId={organizationId}
        />
      </form>
    </Form>
  )
})
