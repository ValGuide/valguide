'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import type { Asset } from '@valguide/core/features/assets/schema'
import { RichTextEditor } from '@valguide/core/features/guides/rich-text-editor'
import type { GuideTranslationWithVersion } from '@valguide/core/features/guides/schema'
import { getVersionedField } from '@valguide/core/features/guides/utils'
import type { SupportedLocale } from '@valguide/i18n/i18n.config'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@valguide/ui/components/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@valguide/ui/components/form'
import { Input } from '@valguide/ui/components/input'
import { useTranslations } from 'next-intl'
import { forwardRef, useEffect, useImperativeHandle, useMemo } from 'react'
import { type UseFormReturn, useForm } from 'react-hook-form'
import { MediaPicker } from '@/features/assets/components/media-picker/media-picker'
import { type GuideTranslationFormData, guideTranslationFormSchema } from '../schemas/guide-form'

export type GuideMetadataFormProps = {
  locale: SupportedLocale
  translation?: GuideTranslationWithVersion
  coverImage?: string | null
  organizationId: string
  onTranslationChange: (data: { title: string; description: string }) => void
  onCoverImageChange?: (url: string | null) => void
  onDirtyChange?: (isDirty: boolean) => void
}

export type GuideMetadataFormRef = {
  form: UseFormReturn<GuideTranslationFormData>
  resetToCurrentValues: () => void
  resetToFormValues: () => void
}

export const GuideMetadataForm = forwardRef<GuideMetadataFormRef, GuideMetadataFormProps>(function GuideMetadataForm(
  { locale, translation, coverImage, organizationId, onTranslationChange, onCoverImageChange, onDirtyChange },
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
        // Reset to fresh prop values - use after refetch when translation data changes
        form.reset({
          title: getVersionedField(translation, 'title', true),
          description: getVersionedField(translation, 'description', true),
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
    const subscription = form.watch((values) => {
      if (values.title !== undefined) {
        onTranslationChange({
          title: values.title ?? '',
          description: values.description ?? '',
        })
      }
    })
    return () => subscription.unsubscribe()
  }, [form, onTranslationChange])

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
                    <Input {...field} placeholder={t('editor.titlePlaceholder')} maxLength={500} required />
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
      </form>
    </Form>
  )
})
