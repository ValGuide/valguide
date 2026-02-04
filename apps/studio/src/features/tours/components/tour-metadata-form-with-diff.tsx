import { useForm, useStore } from '@tanstack/react-form'
import type { FieldDiff } from '@valguide/core/features/tours/tour/locale/compare-tour-locale-diff.fn'
import { useTranslations } from '@valguide/core/i18n/client'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@valguide/core/ui/components/field'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@valguide/ui/components/card'
import { Input } from '@valguide/ui/components/input'
import { RichTextEditor } from '@valguide/ui/components/rich-text/rich-text-editor'
import { forwardRef, useEffect, useImperativeHandle } from 'react'
import { z } from 'zod'
import { DiffFieldLabel } from '@/features/editor/components/diff-aware-field'
import { DiffToggle } from '@/features/editor/components/diff-toggle'
import { InlineDiff } from '@/features/editor/components/inline-diff'

const tourTranslationFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500),
  description: z.string(),
})

export type TourTranslationFormData = z.infer<typeof tourTranslationFormSchema>

export type TourMetadataFormWithDiffProps = {
  locale: string
  versionData?: { title: string; description: string | null }
  onDirtyChange?: (isDirty: boolean) => void
  onSave?: () => void
  readOnly?: boolean
  diffEnabled: boolean
  onDiffToggle: (enabled: boolean) => void
  changedCount: number
  getFieldDiff: (field: string) => FieldDiff | undefined
}

export type TourMetadataFormWithDiffRef = {
  getValues: () => TourTranslationFormData
  resetToCurrentValues: () => void
  resetToFormValues: () => void
}

export const TourMetadataFormWithDiff = forwardRef<TourMetadataFormWithDiffRef, TourMetadataFormWithDiffProps>(
  function TourMetadataFormWithDiff(
    { locale, versionData, onDirtyChange, onSave, readOnly, diffEnabled, onDiffToggle, changedCount, getFieldDiff },
    ref,
  ) {
    const t = useTranslations('tours')

    const form = useForm({
      defaultValues: {
        title: versionData?.title ?? '',
        description: versionData?.description ?? '',
      },
      validators: {
        onSubmit: tourTranslationFormSchema,
      },
    })

    const isDefaultValue = useStore(form.store, (state) => state.isDefaultValue)
    const hasChanges = !isDefaultValue

    useImperativeHandle(
      ref,
      () => ({
        getValues: () => form.state.values,
        resetToCurrentValues: () => {
          form.reset({
            title: versionData?.title ?? '',
            description: versionData?.description ?? '',
          })
        },
        resetToFormValues: () => {
          form.reset(form.state.values)
        },
      }),
      [form, versionData],
    )

    useEffect(() => {
      if (!readOnly) {
        onDirtyChange?.(hasChanges)
      }
    }, [hasChanges, onDirtyChange, readOnly])

    const titleDiff = getFieldDiff('title')
    const descriptionDiff = getFieldDiff('description')

    return (
      <form>
        <Card className={readOnly ? 'opacity-60' : undefined}>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle>
                  {t('editor.tourDetails')}
                  <span className="ml-2 text-sm font-normal uppercase text-muted-foreground">
                    {t('editor.localeIndicator', { locale })}
                  </span>
                </CardTitle>
                <CardDescription>{t('editor.tourDetailsDescription')}</CardDescription>
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
                {(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        <DiffFieldLabel fieldDiff={titleDiff}>{t('editor.titleLabel')}</DiffFieldLabel>
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
                          aria-invalid={isInvalid}
                          placeholder={t('editor.titlePlaceholder')}
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
                      <FieldDescription>
                        {t('editor.characterCount', { current: field.state.value.length })}
                      </FieldDescription>
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  )
                }}
              </form.Field>

              <form.Field name="description">
                {(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel id={`${field.name}-label`}>
                        <DiffFieldLabel fieldDiff={descriptionDiff}>{t('editor.descriptionLabel')}</DiffFieldLabel>
                      </FieldLabel>
                      {diffEnabled && descriptionDiff?.hasChanged ? (
                        <div className="prose prose-sm max-w-none rounded-md border bg-muted/50 p-3 dark:prose-invert">
                          <InlineDiff oldText={descriptionDiff.published} newText={descriptionDiff.draft} />
                        </div>
                      ) : (
                        <RichTextEditor
                          aria-labelledby={`${field.name}-label`}
                          value={field.state.value ?? ''}
                          onChange={field.handleChange}
                          placeholder={t('editor.descriptionPlaceholder')}
                          readOnly={readOnly}
                        />
                      )}
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  )
                }}
              </form.Field>
            </FieldGroup>
          </CardContent>
        </Card>
      </form>
    )
  },
)
