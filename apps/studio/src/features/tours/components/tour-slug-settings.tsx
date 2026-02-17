import { useForm, useStore } from '@tanstack/react-form'
import { useTranslations } from '@valguide/core/i18n/client'
import { Field, FieldDescription, FieldError, FieldLabel } from '@valguide/core/ui/components/field'
import { toast } from '@valguide/core/ui/components/sonner/state'
import { generateSlug, sanitizeSlugInput, slugSchema } from '@valguide/core/utils/slug'
import { Button } from '@valguide/ui/components/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@valguide/ui/components/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@valguide/ui/components/collapsible'
import { Input } from '@valguide/ui/components/input'
import { Skeleton } from '@valguide/ui/components/skeleton'
import { cn } from '@valguide/ui/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { Check, ChevronDown, Link2, Loader2, X } from 'lucide-react'
import { useCallback, useEffect, useState, useTransition } from 'react'
import { useDebounceCallback } from 'usehooks-ts'
import { z } from 'zod'

export type TourSlugCheckResult = {
  available: boolean
  takenBy?: 'other' | 'self' | 'reserved' | 'nanoId'
}

export type UpdateTourSlugResult = {
  success: boolean
  error?: string
  message?: string
}

export type TourSlugHistoryItem = {
  id: string
  slug: string
  createdAt: string
}

export interface TourSlugSettingsProps {
  tourTitle: string
  initialSlug?: string
  slugHistory?: TourSlugHistoryItem[]
  isLoading?: boolean
  variant?: 'card' | 'plain'
  orgSlug: string
  onUpdateSlug?: (newSlug: string) => Promise<UpdateTourSlugResult>
  onCheckSlugAvailable?: (slug: string) => Promise<TourSlugCheckResult>
  onSaved?: () => void
}

export function TourSlugSettings({
  tourTitle,
  initialSlug,
  slugHistory = [],
  isLoading,
  variant = 'card',
  orgSlug,
  onUpdateSlug,
  onCheckSlugAvailable,
  onSaved,
}: TourSlugSettingsProps) {
  const t = useTranslations('tours.editor.slug')
  const [isPending, startTransition] = useTransition()
  const [slugCheckState, setSlugCheckState] = useState<
    'idle' | 'checking' | 'available' | 'taken' | 'reserved' | 'self'
  >('idle')
  const [historyOpen, setHistoryOpen] = useState(false)

  const tourSlugFormSchema = z.object({
    slug: slugSchema,
  })

  const form = useForm({
    defaultValues: {
      slug: initialSlug ?? '',
    },
    validators: {
      onSubmit: tourSlugFormSchema,
    },
    onSubmit: async ({ value }) => {
      if (!onUpdateSlug) return
      startTransition(async () => {
        const result = await onUpdateSlug(value.slug)
        if (result.success) {
          setSlugCheckState('idle')
          onSaved?.()
        } else {
          toast.error(result.message ?? t('saveError'))
        }
      })
    },
  })

  const checkSlugAvailability = useCallback(
    async (slug: string) => {
      if (!onCheckSlugAvailable || !slug) {
        setSlugCheckState('idle')
        return
      }

      const validation = slugSchema.safeParse(slug)
      if (!validation.success) {
        setSlugCheckState('idle')
        return
      }

      setSlugCheckState('checking')
      try {
        const result = await onCheckSlugAvailable(slug)
        if (result.available) {
          setSlugCheckState('available')
        } else if (result.takenBy === 'reserved') {
          setSlugCheckState('reserved')
        } else if (result.takenBy === 'self') {
          setSlugCheckState('self')
        } else {
          setSlugCheckState('taken')
        }
      } catch {
        setSlugCheckState('idle')
      }
    },
    [onCheckSlugAvailable],
  )

  const debouncedCheck = useDebounceCallback(checkSlugAvailability, 300)

  const handleSlugChange = useCallback(
    (newSlug: string) => {
      if (newSlug && newSlug !== initialSlug) {
        setSlugCheckState('checking')
        debouncedCheck(newSlug)
      } else {
        setSlugCheckState('idle')
      }
    },
    [debouncedCheck, initialSlug],
  )

  const handleAutoGenerate = useCallback(() => {
    if (!tourTitle) return
    const newSlug = generateSlug(tourTitle)
    form.setFieldValue('slug', newSlug)
    setSlugCheckState('checking')
    debouncedCheck(newSlug)
  }, [tourTitle, form, debouncedCheck])

  useEffect(() => {
    if (initialSlug) {
      form.setFieldValue('slug', initialSlug)
    }
  }, [initialSlug, form])

  const slugStatusIcon = () => {
    switch (slugCheckState) {
      case 'checking':
        return <Loader2 className="size-4 animate-spin text-muted-foreground" />
      case 'available':
        return <Check className="size-4 text-success" />
      case 'taken':
      case 'reserved':
      case 'self':
        return <X className="size-4 text-destructive" />
      default:
        return null
    }
  }

  const slugStatusMessage = () => {
    switch (slugCheckState) {
      case 'checking':
        return <span className="text-muted-foreground">{t('checking')}</span>
      case 'available':
        return <span className="text-success">{t('available')}</span>
      case 'taken':
        return <span className="text-destructive">{t('taken')}</span>
      case 'reserved':
        return <span className="text-destructive">{t('reserved')}</span>
      case 'self':
        return <span className="text-muted-foreground">{t('self')}</span>
      default:
        return null
    }
  }

  const historyItems = slugHistory
  const currentSlug = useStore(form.store, (state) => state.values.slug)
  const canSubmit = slugCheckState === 'available' && currentSlug !== initialSlug && !isPending

  const Wrapper = variant === 'card' ? Card : 'div'

  if (isLoading) {
    return (
      <Wrapper>
        {variant === 'card' && (
          <CardHeader>
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
        )}
        <div className={cn('space-y-4', variant === 'card' && 'p-6 pt-0')}>
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>
      </Wrapper>
    )
  }

  return (
    <Wrapper>
      {variant === 'card' && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-4 w-4" />
            {t('title')}
          </CardTitle>
          <CardDescription>{t('dialogDescription')}</CardDescription>
        </CardHeader>
      )}
      <div className={cn(variant === 'card' && 'p-6 pt-0')}>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
          className="space-y-4"
        >
          <form.Field name="slug">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field data-invalid={isInvalid}>
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor={field.name}>{t('title')}</FieldLabel>
                    {!initialSlug && tourTitle && (
                      <Button type="button" variant="ghost" size="sm" onClick={handleAutoGenerate}>
                        {t('autoGenerate')}
                      </Button>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      id={field.name}
                      value={field.state.value}
                      onBlur={() => {
                        const trimmed = field.state.value.replace(/^-+|-+$/g, '')
                        if (trimmed !== field.state.value) {
                          field.handleChange(trimmed)
                          handleSlugChange(trimmed)
                        }
                        field.handleBlur()
                      }}
                      onChange={(e) => {
                        const sanitized = sanitizeSlugInput(e.target.value)
                        field.handleChange(sanitized)
                        handleSlugChange(sanitized)
                      }}
                      aria-invalid={isInvalid}
                      placeholder={t('placeholder')}
                      className="pr-10"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">{slugStatusIcon()}</div>
                  </div>
                  <FieldDescription>
                    {t('description', {
                      baseUrl: `valguide.com/${orgSlug}`,
                      slug: field.state.value || t('placeholder'),
                    })}
                  </FieldDescription>
                  {slugStatusMessage() && <p className="text-sm">{slugStatusMessage()}</p>}
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          </form.Field>

          {historyItems.length > 0 && (
            <Collapsible open={historyOpen} onOpenChange={setHistoryOpen}>
              <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-sm font-medium hover:underline">
                {t('history')}
                <ChevronDown className={cn('size-4 transition-transform', historyOpen && 'rotate-180')} />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <p className="text-sm text-muted-foreground mb-2">{t('historyDescription')}</p>
                <ul className="space-y-1">
                  {historyItems.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between text-sm py-1.5 px-2 rounded-md bg-muted/50"
                    >
                      <code className="font-mono text-xs">{item.slug}</code>
                      <span className="text-muted-foreground text-xs">
                        {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                      </span>
                    </li>
                  ))}
                </ul>
              </CollapsibleContent>
            </Collapsible>
          )}

          <Button type="submit" disabled={!canSubmit}>
            {isPending ? t('saving') : t('save')}
          </Button>
        </form>
      </div>
    </Wrapper>
  )
}
