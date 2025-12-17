'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import type { Asset } from '@valguide/core/features/assets/schema'
import { TranslationStatusBadge } from '@valguide/core/features/guides/components/translation-status-badge'
import { RichTextEditor } from '@valguide/core/features/guides/rich-text-editor'
import type { StopWithTranslations } from '@valguide/core/features/guides/schema'
import { getVersionedField } from '@valguide/core/features/guides/utils'
import type { SupportedLocale } from '@valguide/i18n/i18n.config'
import { Button } from '@valguide/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@valguide/ui/components/card'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@valguide/ui/components/form'
import { Input } from '@valguide/ui/components/input'
import { Mic } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { forwardRef, useEffect, useImperativeHandle } from 'react'
import { type UseFormReturn, useForm } from 'react-hook-form'
import { MediaPicker } from '@/features/assets/components/media-picker/media-picker'
import { type StopTranslationFormData, stopTranslationFormSchema } from '../schemas/guide-form'

export type StopLocaleEditorProps = {
  stop?: StopWithTranslations
  locale: SupportedLocale
  organizationId: string
  onChange?: (data: StopTranslationFormData) => void
  onDirtyChange?: (isDirty: boolean) => void
  onAudioChange?: (asset: Asset | null) => Promise<void>
  onSave?: () => void
  audio?: Asset | null
}

export type StopLocaleEditorRef = {
  form: UseFormReturn<StopTranslationFormData>
  resetToCurrentValues: () => void
  resetToFormValues: () => void
}

export const StopLocaleEditor = forwardRef<StopLocaleEditorRef, StopLocaleEditorProps>(function StopLocaleEditor(
  { stop, locale, organizationId, onChange, onDirtyChange, onAudioChange, onSave, audio = null },
  ref,
) {
  const t = useTranslations('stops.editor')
  const tGuides = useTranslations('guides')

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
        form.reset({
          title: getVersionedField(translation, 'title', true),
          description: getVersionedField(translation, 'description', true),
          transcription: getVersionedField(translation, 'transcription', true),
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
        onChange?.({
          title: values.title ?? '',
          description: values.description ?? '',
          transcription: values.transcription ?? '',
        })
      }
    })
    return () => subscription.unsubscribe()
  }, [form, onChange])

  const handleAudioChange = async (value: Asset | Asset[] | null) => {
    if (value === null || (!Array.isArray(value) && value)) {
      await onAudioChange?.(value as Asset | null)
    }
  }

  return (
    <Form {...form}>
      <form>
        <Card>
          <CardHeader>
            <CardTitle>
              {t('title')}{' '}
              <span className="ml-2 text-sm font-normal uppercase text-muted-foreground">
                {tGuides('editor.localeIndicator', { locale })}
              </span>
            </CardTitle>
            <CardDescription>{t('localeContentDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
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

            {/* Audio - locale-specific */}
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
          </CardContent>
        </Card>
      </form>
    </Form>
  )
})
