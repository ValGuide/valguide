'use client'

import { GuidePreviewCard } from '@valguide/core/features/guides/preview-card'
import type { Guide } from '@valguide/features/guides/types'
import { Button } from '@valguide/ui/components/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@valguide/ui/components/empty'
import { Skeleton } from '@valguide/ui/components/skeleton'
import { AlertCircle, BookOpen, Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import * as React from 'react'
import { toast } from 'sonner'

interface GuidesListProps {
  guides?: Guide[]
  isLoading?: boolean
  error?: Error | null
  onCreateGuide?: (data: {
    translations: Array<{ locale: string; title: string; description?: string }>
    organizationId?: string
    coverImage?: string
  }) => Promise<Guide>
  onViewGuide?: (guide: Guide) => void
  onRetry?: () => void
}

export function GuidesList({
  guides = [],
  isLoading = false,
  error = null,
  onCreateGuide,
  onViewGuide,
  onRetry,
}: GuidesListProps) {
  const t = useTranslations('guides')
  const tCommon = useTranslations('common')
  const [isCreating, setIsCreating] = React.useState(false)

  const handleViewGuide = React.useCallback(
    (guide: Guide) => {
      onViewGuide?.(guide)
    },
    [onViewGuide],
  )

  const handleCreateGuide = React.useCallback(async () => {
    if (!onCreateGuide) {
      console.error('onCreateGuide handler not provided')
      return
    }

    try {
      setIsCreating(true)

      // Create a new guide with default translations in all supported languages
      const newGuide = await onCreateGuide({
        translations: [
          {
            locale: 'en',
            title: 'New Guide',
            description: 'Start creating your guide content',
          },
          {
            locale: 'de',
            title: 'Neuer Guide',
            description: 'Beginnen Sie mit der Erstellung Ihres Guide-Inhalts',
          },
          {
            locale: 'rm',
            title: 'Nova Guida',
            description: 'Cumenzai a crear il cuntegn da tia guida',
          },
        ],
      })

      toast.success(t('create.success'), {
        description: t('create.successDescription'),
      })

      // Navigate to guide editor if handler provided
      if (onViewGuide && newGuide) {
        onViewGuide(newGuide)
      }
    } catch (err) {
      console.error('Failed to create guide:', err)
      toast.error(t('create.error'), {
        description: err instanceof Error ? err.message : t('create.errorDescription'),
      })
    } finally {
      setIsCreating(false)
    }
  }, [onCreateGuide, t, onViewGuide])

  // Loading state
  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-9 w-40" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton elements
            <div key={`skeleton-${i}`} className="overflow-hidden rounded-xl border">
              <Skeleton className="h-48 w-full" />
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-4 w-full" />
                <div className="pt-2 flex items-center justify-between">
                  <Skeleton className="h-8 w-24" />
                </div>
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <AlertCircle className="text-destructive" />
          </EmptyMedia>
          <EmptyTitle>{t('error.failedToLoad')}</EmptyTitle>
          <EmptyDescription>{error.message || t('error.unexpected')}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={onRetry} variant="outline">
            {tCommon('tryAgain')}
          </Button>
        </EmptyContent>
      </Empty>
    )
  }

  // Empty state when no guides exist
  if (guides.length === 0) {
    return (
      <div className="mx-auto max-w-3xl">
        <Empty className="border bg-muted/10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BookOpen className="h-10 w-10 text-amber-600" />
            </EmptyMedia>
            <EmptyTitle className="text-xl">{t('empty.title')}</EmptyTitle>
            <EmptyDescription className="text-base">{t('empty.heroDescription')}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent className="space-y-6">
            <div className="grid gap-4 text-left text-sm text-muted-foreground md:grid-cols-2">
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                  <span>{t('empty.feature1')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                  <span>{t('empty.feature2')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                  <span>{t('empty.feature3')}</span>
                </li>
              </ul>
              <div className="rounded-lg border bg-background p-4 text-xs italic leading-relaxed text-muted-foreground/80">
                "{t('empty.quote')}"
              </div>
            </div>
            <Button onClick={handleCreateGuide} size="lg" disabled={isCreating} className="group">
              <Plus className="transition-transform group-hover:rotate-90" />
              {isCreating ? t('empty.creating') : t('empty.createButton')}
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    )
  }

  // List view when guides exist
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('title')}</h2>
          <p className="text-sm text-muted-foreground">{t('description')}</p>
        </div>
        <Button onClick={handleCreateGuide} disabled={isCreating} className="group">
          <Plus className="transition-transform group-hover:rotate-90" />
          {isCreating ? t('empty.creating') : t('empty.createNewButton')}
        </Button>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {guides.map((guide) => (
          <GuidePreviewCard key={guide.id} guide={guide} onViewDetails={handleViewGuide} />
        ))}
      </div>
    </div>
  )
}
