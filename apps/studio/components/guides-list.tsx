'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { Plus, BookOpen, AlertCircle } from 'lucide-react'
import { Button } from '@valguide/ui/components/button'
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from '@valguide/ui/components/empty'
import { Skeleton } from '@valguide/ui/components/skeleton'
import { Guide } from '@valguide/features/guides/types'
import { GuidePreviewCard } from '@valguide/core/features/guides/preview-card'

interface GuidesListProps {
  guides?: Guide[]
  isLoading?: boolean
  error?: Error | null
  onCreateGuide?: () => void
}

export function GuidesList({ guides = [], isLoading = false, error = null, onCreateGuide }: GuidesListProps) {
  const t = useTranslations('guides')

  const handleCreateGuide = React.useCallback(() => {
    onCreateGuide?.()
    // TODO: Navigate to guide creation page or open modal
    console.log('Create guide clicked')
  }, [onCreateGuide])

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
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-3">
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
          <EmptyTitle>Failed to load guides</EmptyTitle>
          <EmptyDescription>{error.message || 'An unexpected error occurred'}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try again
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
          <Button onClick={handleCreateGuide} size="lg">
            <Plus />
            {t('empty.createButton')}
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
        <Button onClick={handleCreateGuide}>
          <Plus />
          {t('empty.createNewButton')}
        </Button>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {guides.map((guide) => (
          <GuidePreviewCard key={guide.id} guide={guide} />
        ))}
      </div>
    </div>
  )
}

