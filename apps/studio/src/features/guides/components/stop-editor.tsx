import type { AnyFormApi } from '@tanstack/react-form'
import { useForm, useStore } from '@tanstack/react-form'
import type { Asset } from '@valguide/core/features/assets/schema'
import { TranslationStatusBadge } from '@valguide/core/features/guides/components/translation-status-badge'
import { RichTextEditor } from '@valguide/core/features/guides/rich-text-editor'
import type { StopWithTranslations } from '@valguide/core/features/guides/schema'
import { getVersionedField } from '@valguide/core/features/guides/utils'
import { useTranslations } from '@valguide/core/i18n/client'
import { Button } from '@valguide/ui/components/button'
import { Field, FieldGroup, FieldLabel } from '@valguide/ui/components/field'
import { Input } from '@valguide/ui/components/input'
import { Mic } from 'lucide-react'
import { forwardRef, useEffect, useImperativeHandle } from 'react'
import type { MediaPickerComponent } from '@/features/assets/components/media-picker/types'
import { stopTranslationFormSchema } from '../schemas/guide-form'

export type StopEditorProps = {
  stop?: StopWithTranslations
  locale: string
  onDirtyChange?: (isDirty: boolean) => void
  onAudioChange?: (asset: Asset | null) => void
  onSave?: () => void
  images?: Asset[]
  audio?: Asset | null
  MediaPicker: MediaPickerComponent
}

export type StopEditorRef = {
  form: AnyFormApi
  resetToCurrentValues: () => void
  resetToFormValues: () => void
}

export const StopEditor = forwardRef<StopEditorRef, StopEditorProps>(function StopEditor(
  { stop, locale, onDirtyChange, onImageChange, onAudioChange, onSave, images = [], audio = null, MediaPicker },
  ref,
) {
  const t = useTranslations('stops.editor')

  const translation = stop?.translations.find((t) => t.locale === locale)
  const hasDraft = !!translation?.draftVersionId
  const publishedStatus = translation?.currentVersion?.status

  const form = useForm({
    defaultValues: {
      title: getVersionedField(translation, 'title', true),
      description: getVersionedField(translation, 'description', true),
      transcription: getVersionedField(translation, 'transcription', true),
    },
    validators: {
      onSubmit: stopTranslationFormSchema,
    },
  })

  // Use !isDefaultValue instead of isDirty for non-persistent dirty tracking
  // isDirty in TanStack Form stays true once changed (persistent), even if reverted
  // isDefaultValue is false when current values differ from defaults (what we want)
  // Must use useStore(form.store) for reactivity - form.state is just a snapshot
  const isDefaultValue = useStore(form.store, (state) => state.isDefaultValue)
  const hasChanges = !isDefaultValue

  useImperativeHandle(
    ref,
    () => ({
      form,
      resetToCurrentValues: () => {
        form.reset({
          title: getVersionedField(translation, 'title', true),
          description: getVersionedField(translation, 'description', true),
          transcription: getVersionedField(translation, 'transcription', true),
        })
      },
      resetToFormValues: () => {
        form.reset(form.state.values)
      },
    }),
    [form, translation],
  )

  useEffect(() => {
    onDirtyChange?.(hasChanges)
  }, [hasChanges, onDirtyChange])

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
    <form className="space-y-6 rounded-xl border bg-card p-6">
      <FieldGroup>
        {/* Title */}
        <form.Field name="title">
          {(field) => (
            <Field>
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor={field.name}>{t('titleLabel')}</FieldLabel>
                <TranslationStatusBadge status={publishedStatus} hasDraft={hasDraft} />
              </div>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
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
            </Field>
          )}
        </form.Field>

        {/* Audio */}
        <MediaPicker
          mode="single"
          mediaTypes={['audio']}
          value={audio}
          onChange={handleAudioChange}
          label={t('audioLabel')}
          locale={locale}
        />

        {/* Description */}
        <form.Field name="description">
          {(field) => (
            <Field>
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor={field.name}>{t('descriptionLabel')}</FieldLabel>
                <Button type="button" variant="ghost" size="sm" className="gap-1">
                  <Mic className="h-4 w-4" />
                  {t('autoGenerate')}
                </Button>
              </div>
              <RichTextEditor
                value={field.state.value}
                onChange={field.handleChange}
                placeholder={t('descriptionPlaceholder')}
              />
            </Field>
          )}
        </form.Field>

        {/* Gallery */}
        <MediaPicker
          mode="multiple"
          mediaTypes={['image', 'video']}
          value={images}
          onChange={handleImagesChange}
          label={t('galleryLabel')}
        />
      </FieldGroup>
    </form>
  )
})
