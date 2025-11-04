'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { Plus, BookOpen } from 'lucide-react'
import { Button } from '@valguide/ui/components/button'
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from '@valguide/ui/components/empty'
import { Guide } from '@valguide/core/features/guides/schema'
import { GuidePreviewCard } from '@valguide/core/features/guides/preview-card'

interface GuidesListProps {
  guides?: Guide[]
  onCreateGuide?: () => void
}

export function GuidesList({ guides = [], onCreateGuide }: GuidesListProps) {
  const t = useTranslations('guides')

  const handleCreateGuide = React.useCallback(() => {
    onCreateGuide?.()
    // TODO: Navigate to guide creation page or open modal
    console.log('Create guide clicked')
  }, [onCreateGuide])

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

