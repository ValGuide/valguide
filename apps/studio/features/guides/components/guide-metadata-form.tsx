'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { RichTextEditor } from '@valguide/core/features/guides/rich-text-editor'
import type { GuideTranslationWithVersion } from '@valguide/core/features/guides/schema'
import { getVersionedField } from '@valguide/core/features/guides/utils'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@valguide/ui/components/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@valguide/ui/components/form'
import { Input } from '@valguide/ui/components/input'
import { useTranslations } from 'next-intl'
import { forwardRef, useEffect, useImperativeHandle } from 'react'
import { type UseFormReturn, useForm } from 'react-hook-form'
import { type GuideTranslationFormData, guideTranslationFormSchema } from '../schemas/guide-form'

export type GuideMetadataFormProps = {
  locale: string
  translation?: GuideTranslationWithVersion
  organizationId: string
  onTranslationChange: (data: { title: string; description: string }) => void
  onDirtyChange?: (isDirty: boolean) => void
  onSave?: () => void
}

export type GuideMetadataFormRef = {
  form: UseFormReturn<GuideTranslationFormData>
  resetToCurrentValues: () => void
  resetToFormValues: () => void
}

export const GuideMetadataForm = forwardRef<GuideMetadataFormRef, GuideMetadataFormProps>(function GuideMetadataForm(
  { locale, translation, organizationId, onTranslationChange, onDirtyChange, onSave },
  ref,
) {
  const t = useTranslations('guides')

  const form = useForm<GuideTranslationFormData>({
    resolver: zodResolver(guideTranslationFormSchema),
    defaultValues: {
      title: getVersionedField(translation, 'title', true),
      description: getVersionedField(translation, 'description', true),
    },
  })

  const { isDirty } = form.formState

  useImperativeHandle(
    ref,
    () => ({
      form,
      resetToCurrentValues: () => {
        form.reset({
          title: getVersionedField(translation, 'title', true),
          description: getVersionedField(translation, 'description', true),
        })
      },
      resetToFormValues: () => {
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
      if (type === 'change' && values.title !== undefined) {
        onTranslationChange({
          title: values.title ?? '',
          description: values.description ?? '',
        })
      }
    })
    return () => subscription.unsubscribe()
  }, [form, onTranslationChange])

  const title = form.watch('title')

  return (
    <Form {...form}>
      <form>
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
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('editor.titleLabel')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t('editor.titlePlaceholder')}
                      maxLength={500}
                      required
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          onSave?.()
                        }
                      }}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    {t('editor.characterCount', { current: title.length })}
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('editor.descriptionLabel')}</FormLabel>
                  <FormControl>
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                      placeholder={t('editor.descriptionPlaceholder')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
      </form>
    </Form>
  )
})
