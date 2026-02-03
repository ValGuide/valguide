import { useForm, useStore } from '@tanstack/react-form'
import type { Asset } from '@valguide/core/features/assets/types'
import { useTranslations } from '@valguide/core/i18n/client'
import { Field, FieldError, FieldGroup, FieldLabel } from '@valguide/core/ui/components/field'
import type { StopTranslationVersionContent } from '@valguide/features/guides/types'
import { Button } from '@valguide/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@valguide/ui/components/card'
import { Input } from '@valguide/ui/components/input'
import { RichTextEditor } from '@valguide/ui/components/rich-text/rich-text-editor'
import { Mic } from 'lucide-react'
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import type { MediaPickerComponent } from '@/features/assets/components/media-picker/types'
import { type StopTranslationFormData, stopTranslationFormSchema } from '@/features/guides/schemas/guide-form'

export type StopLocaleEditorProps = {
  locale: string
  onDirtyChange?: (isDirty: boolean) => void
  onAudioChange?: (asset: Asset | null) => void
  onSave?: () => void
  audio?: Asset | null
  readOnly?: boolean
  versionData?: Omit<StopTranslationVersionContent, 'id'>
  MediaPicker: MediaPickerComponent
}

export type StopLocaleEditorRef = {
  getValues: () => StopTranslationFormData
  isDirty: () => boolean
  resetToCurrentValues: () => void
  resetToFormValues: () => void
}

export const StopLocaleEditor = forwardRef<StopLocaleEditorRef, StopLocaleEditorProps>(function StopLocaleEditor(
  { locale, onDirtyChange, onAudioChange, onSave, audio = null, readOnly = false, versionData, MediaPicker },
  ref,
) {
  const t = useTranslations('stops.editor')
  const tGuides = useTranslations('guides')

  // Store initial values for reset functionality
  const initialValuesRef = useRef({
    title: versionData?.title ?? '',
    description: versionData?.description ?? '',
    transcription: versionData?.transcription ?? '',
  })

  const form = useForm({
    defaultValues: initialValuesRef.current,
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
      getValues: () => form.state.values,
      isDirty: () => !form.state.isDefaultValue,
      resetToCurrentValues: () => {
        form.reset(initialValuesRef.current)
      },
      resetToFormValues: () => {
        form.reset(form.state.values)
      },
    }),
    [form],
  )

  useEffect(() => {
    if (!readOnly) {
      onDirtyChange?.(hasChanges)
    }
  }, [hasChanges, onDirtyChange, readOnly])

  const handleAudioChange = async (value: Asset | Asset[] | null) => {
    if (value === null || (!Array.isArray(value) && value)) {
      await onAudioChange?.(value as Asset | null)
    }
  }

  return (
    <form>
      <Card className={readOnly ? 'opacity-60' : undefined}>
        <CardHeader>
          <CardTitle>
            {t('title')}
            <span className="ml-2 text-sm font-normal uppercase text-muted-foreground">
              {tGuides('editor.localeIndicator', { locale })}
            </span>
          </CardTitle>
          <CardDescription>{t('localeContentDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <form.Field name="title">
              {(field) => (
                <Field data-invalid={field.state.meta.errors.length > 0}>
                  <FieldLabel htmlFor={field.name}>{t('titleLabel')}</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder={t('titlePlaceholder')}
                    maxLength={500}
                    required
                    disabled={readOnly}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        onSave?.()
                      }
                    }}
                  />
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )}
            </form.Field>

            <MediaPicker
              mode="single"
              mediaTypes={['audio']}
              value={audio}
              onChange={handleAudioChange}
              label={t('audioLabel')}
              locale={locale}
              disabled={readOnly}
            />

            <form.Field name="description">
              {(field) => (
                <Field data-invalid={field.state.meta.errors.length > 0}>
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor={field.name}>{t('descriptionLabel')}</FieldLabel>
                    <Button type="button" variant="ghost" size="sm" className="gap-1" disabled={readOnly}>
                      <Mic className="h-4 w-4" />
                      {t('autoGenerate')}
                    </Button>
                  </div>
                  <RichTextEditor
                    value={field.state.value}
                    onChange={field.handleChange}
                    placeholder={t('descriptionPlaceholder')}
                    readOnly={readOnly}
                  />
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )}
            </form.Field>
          </FieldGroup>
        </CardContent>
      </Card>
    </form>
  )
})
