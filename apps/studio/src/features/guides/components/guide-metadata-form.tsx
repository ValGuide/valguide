import { useForm, useStore } from '@tanstack/react-form'
import { RichTextEditor } from '@valguide/core/features/guides/components/rich-text-editor'
import { useTranslations } from '@valguide/core/i18n/client'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@valguide/core/ui/components/field'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@valguide/ui/components/card'
import { Input } from '@valguide/ui/components/input'
import { forwardRef, useEffect, useImperativeHandle } from 'react'
import { z } from 'zod'

const guideTranslationFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500),
  description: z.string(),
})

export type GuideTranslationFormData = z.infer<typeof guideTranslationFormSchema>

export type GuideMetadataFormProps = {
  locale: string
  versionData?: { title: string; description: string | null }
  onDirtyChange?: (isDirty: boolean) => void
  onSave?: () => void
  readOnly?: boolean
}

export type GuideMetadataFormRef = {
  getValues: () => GuideTranslationFormData
  resetToCurrentValues: () => void
  resetToFormValues: () => void
}

export const GuideMetadataForm = forwardRef<GuideMetadataFormRef, GuideMetadataFormProps>(function GuideMetadataForm(
  { locale, versionData, onDirtyChange, onSave, readOnly },
  ref,
) {
  const t = useTranslations('guides')

  const form = useForm({
    defaultValues: {
      title: versionData?.title ?? '',
      description: versionData?.description ?? '',
    },
    validators: {
      onSubmit: guideTranslationFormSchema,
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

  return (
    <form>
      <Card className={readOnly ? 'opacity-60' : undefined}>
        <CardHeader>
          <CardTitle>
            {t('editor.guideDetails')}{' '}
            <span className="ml-2 text-sm font-normal uppercase text-muted-foreground">
              {t('editor.localeIndicator', { locale })}
            </span>
          </CardTitle>
          <CardDescription>{t('editor.guideDetailsDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <form.Field name="title">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>{t('editor.titleLabel')}</FieldLabel>
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
                    <FieldLabel id={`${field.name}-label`}>{t('editor.descriptionLabel')}</FieldLabel>
                    <RichTextEditor
                      aria-labelledby={`${field.name}-label`}
                      value={field.state.value ?? ''}
                      onChange={field.handleChange}
                      placeholder={t('editor.descriptionPlaceholder')}
                      readOnly={readOnly}
                    />
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
})
