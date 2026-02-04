import { useForm, useStore } from '@tanstack/react-form'
import type { Asset } from '@valguide/core/features/assets/types'
import type { FieldDiff } from '@valguide/core/features/tours/stop/locale/compare-stop-locale-diff.fn'
import type { StopTranslationContent } from '@valguide/core/features/tours/stop/locale/types'
import { useTranslations } from '@valguide/core/i18n/client'
import { Field, FieldError, FieldGroup, FieldLabel } from '@valguide/core/ui/components/field'
import { Button } from '@valguide/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@valguide/ui/components/card'
import { Input } from '@valguide/ui/components/input'
import { RichTextEditor } from '@valguide/ui/components/rich-text/rich-text-editor'
import { Mic } from 'lucide-react'
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import type { MediaPickerComponent } from '@/features/assets/components/media-picker/types'
import { DiffFieldLabel } from '@/features/editor/components/diff-aware-field'
import { DiffToggle } from '@/features/editor/components/diff-toggle'
import { InlineDiff } from '@/features/editor/components/inline-diff'
import { type StopTranslationFormData, stopTranslationFormSchema } from '@/features/tours/schemas/tour-form'

export type StopLocaleEditorWithDiffProps = {
  locale: string
  onDirtyChange?: (isDirty: boolean) => void
  onAudioChange?: (asset: Asset | null) => void
  onSave?: () => void
  audio?: Asset | null
  readOnly?: boolean
  draftData?: Omit<StopTranslationContent, 'id'>
  MediaPicker: MediaPickerComponent
  diffEnabled: boolean
  onDiffToggle: (enabled: boolean) => void
  changedCount: number
  getFieldDiff: (field: string) => FieldDiff | undefined
}

export type StopLocaleEditorWithDiffRef = {
  getValues: () => StopTranslationFormData
  isDirty: () => boolean
  resetToCurrentValues: () => void
  resetToFormValues: () => void
}

export const StopLocaleEditorWithDiff = forwardRef<StopLocaleEditorWithDiffRef, StopLocaleEditorWithDiffProps>(
  function StopLocaleEditorWithDiff(
    {
      locale,
      onDirtyChange,
      onAudioChange,
      onSave,
      audio = null,
      readOnly = false,
      draftData,
      MediaPicker,
      diffEnabled,
      onDiffToggle,
      changedCount,
      getFieldDiff,
    },
    ref,
  ) {
    const t = useTranslations('stops.editor')
    const tTours = useTranslations('tours')

    const initialValuesRef = useRef({
      title: draftData?.title ?? '',
      description: draftData?.description ?? '',
      transcription: draftData?.transcription ?? '',
    })

    const form = useForm({
      defaultValues: initialValuesRef.current,
      validators: {
        onSubmit: stopTranslationFormSchema,
      },
    })

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

    const titleDiff = getFieldDiff('title')
    const descriptionDiff = getFieldDiff('description')
    // Transcription diff is available but not rendered - UI for transcription not yet implemented
    const _transcriptionDiff = getFieldDiff('transcription')
    void _transcriptionDiff

    return (
      <form>
        <Card className={readOnly ? 'opacity-60' : undefined}>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle>
                  {t('title')}
                  <span className="ml-2 text-sm font-normal uppercase text-muted-foreground">
                    {tTours('editor.localeIndicator', { locale })}
                  </span>
                </CardTitle>
                <CardDescription>{t('localeContentDescription')}</CardDescription>
              </div>
              <DiffToggle
                enabled={diffEnabled}
                onToggle={onDiffToggle}
                changedCount={changedCount}
                disabled={readOnly}
              />
            </div>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <form.Field name="title">
                {(field) => (
                  <Field data-invalid={field.state.meta.errors.length > 0}>
                    <FieldLabel htmlFor={field.name}>
                      <DiffFieldLabel fieldDiff={titleDiff}>{t('titleLabel')}</DiffFieldLabel>
                    </FieldLabel>
                    {diffEnabled && titleDiff?.hasChanged ? (
                      <div className="rounded-md border bg-muted/50 p-3">
                        <InlineDiff oldText={titleDiff.published} newText={titleDiff.draft} />
                      </div>
                    ) : (
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
                    )}
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
                      <FieldLabel htmlFor={field.name}>
                        <DiffFieldLabel fieldDiff={descriptionDiff}>{t('descriptionLabel')}</DiffFieldLabel>
                      </FieldLabel>
                      <Button type="button" variant="ghost" size="sm" className="gap-1" disabled={readOnly}>
                        <Mic className="h-4 w-4" />
                        {t('autoGenerate')}
                      </Button>
                    </div>
                    {diffEnabled && descriptionDiff?.hasChanged ? (
                      <div className="prose prose-sm max-w-none rounded-md border bg-muted/50 p-3 dark:prose-invert">
                        <InlineDiff oldText={descriptionDiff.published} newText={descriptionDiff.draft} />
                      </div>
                    ) : (
                      <RichTextEditor
                        value={field.state.value}
                        onChange={field.handleChange}
                        placeholder={t('descriptionPlaceholder')}
                        readOnly={readOnly}
                      />
                    )}
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )}
              </form.Field>
            </FieldGroup>
          </CardContent>
        </Card>
      </form>
    )
  },
)
