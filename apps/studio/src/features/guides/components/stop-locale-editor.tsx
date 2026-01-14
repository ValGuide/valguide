import { zodResolver } from '@hookform/resolvers/zod'
import type { Asset } from '@valguide/core/features/assets/types'
import { RichTextEditor } from '@valguide/core/features/guides/rich-text-editor'
import type { StopWithTranslations } from '@valguide/core/features/guides/schema-types'
import { getVersionedField } from '@valguide/core/features/guides/utils'
import { useTranslations } from '@valguide/core/i18n/client'
import { Button } from '@valguide/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@valguide/ui/components/card'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@valguide/ui/components/form'
import { Input } from '@valguide/ui/components/input'
import { Mic } from 'lucide-react'
import { forwardRef, useEffect, useImperativeHandle } from 'react'
import { type UseFormReturn, useForm } from 'react-hook-form'
import type { MediaPickerComponent } from '@/features/assets/components/media-picker/types'
import { type StopTranslationFormData, stopTranslationFormSchema } from '../schemas/guide-form'

export type StopLocaleEditorProps = {
  stop?: StopWithTranslations
  locale: string
  onChange?: (data: StopTranslationFormData) => void
  onDirtyChange?: (isDirty: boolean) => void
  onAudioChange?: (asset: Asset | null) => Promise<void>
  onSave?: () => void
  audio?: Asset | null
  readOnly?: boolean
  versionData?: { title: string; description: string | null; transcription: string | null }
  MediaPicker: MediaPickerComponent
}

export type StopLocaleEditorRef = {
  form: UseFormReturn<StopTranslationFormData>
  resetToCurrentValues: () => void
  resetToFormValues: () => void
}

export const StopLocaleEditor = forwardRef<StopLocaleEditorRef, StopLocaleEditorProps>(function StopLocaleEditor(
  {
    stop,
    locale,
    onChange,
    onDirtyChange,
    onAudioChange,
    onSave,
    audio = null,
    readOnly = false,
    versionData,
    MediaPicker,
  },
  ref,
) {
  const t = useTranslations('stops.editor')
  const tGuides = useTranslations('guides')

  const translation = stop?.translations.find((t) => t.locale === locale)

  const getDefaultValues = () => {
    if (versionData) {
      return {
        title: versionData.title,
        description: versionData.description ?? '',
        transcription: versionData.transcription ?? '',
      }
    }
    return {
      title: getVersionedField(translation, 'title', true),
      description: getVersionedField(translation, 'description', true),
      transcription: getVersionedField(translation, 'transcription', true),
    }
  }

  const form = useForm<StopTranslationFormData>({
    resolver: zodResolver(stopTranslationFormSchema),
    defaultValues: getDefaultValues(),
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
    if (!readOnly) {
      onDirtyChange?.(isDirty)
    }
  }, [isDirty, onDirtyChange, readOnly])

  useEffect(() => {
    if (readOnly) return
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
  }, [form, onChange, readOnly])

  const handleAudioChange = async (value: Asset | Asset[] | null) => {
    if (value === null || (!Array.isArray(value) && value)) {
      await onAudioChange?.(value as Asset | null)
    }
  }

  return (
    <Form {...form}>
      <form>
        <Card className={readOnly ? 'opacity-60' : undefined}>
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
                  <FormLabel>{t('titleLabel')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t('titlePlaceholder')}
                      maxLength={500}
                      required
                      disabled={readOnly}
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
              locale={locale}
              disabled={readOnly}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>{t('descriptionLabel')}</FormLabel>
                    <Button type="button" variant="ghost" size="sm" className="gap-1" disabled={readOnly}>
                      <Mic className="h-4 w-4" />
                      {t('autoGenerate')}
                    </Button>
                  </div>
                  <FormControl>
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                      placeholder={t('descriptionPlaceholder')}
                      readOnly={readOnly}
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
