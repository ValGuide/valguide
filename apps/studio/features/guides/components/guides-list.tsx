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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-9 w-40" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          {[...Array(6)].map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton elements
            <div key={`skeleton-${i}`} className="space-y-3">
              <Skeleton className="h-48 w-full rounded-xl" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
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
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <BookOpen />
          </EmptyMedia>
          <EmptyTitle>{t('empty.title')}</EmptyTitle>
          <EmptyDescription>{t('empty.description')}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={handleCreateGuide} size="lg" disabled={isCreating}>
            <Plus />
            {isCreating ? t('empty.creating') : t('empty.createButton')}
          </Button>
        </EmptyContent>
      </Empty>
    )
  }

  // List view when guides exist
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('title')}</h2>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>
        <Button onClick={handleCreateGuide} disabled={isCreating}>
          <Plus />
          {isCreating ? t('empty.creating') : t('empty.createNewButton')}
        </Button>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        {guides.map((guide) => (
          <GuidePreviewCard key={guide.id} guide={guide} onViewDetails={handleViewGuide} />
        ))}
      </div>
    </div>
  )
}
