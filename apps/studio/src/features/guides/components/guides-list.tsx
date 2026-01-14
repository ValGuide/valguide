import { GuidePreviewCard } from '@valguide/core/features/guides/preview-card'
import type { GuideWithTranslations } from '@valguide/core/features/guides/schema'
import type { Guide, GuideWithTranslationsAndCover } from '@valguide/core/features/guides/types'
import { useTranslations } from '@valguide/core/i18n/client'
import { Button } from '@valguide/ui/components/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@valguide/ui/components/empty'
import { PageTitle } from '@valguide/ui/components/page-title'
import { Skeleton } from '@valguide/ui/components/skeleton'
import { AlertCircle, BookOpen, Plus } from 'lucide-react'
import * as React from 'react'
import { toast } from 'sonner'

function toGuideForPreview(guide: GuideWithTranslationsAndCover): Guide {
  const translation = guide.translations.find((t) => t.locale === 'de') ?? guide.translations[0]
  const version = translation?.draftVersion ?? translation?.currentVersion
  return {
    id: guide.id,
    nanoId: guide.nanoId,
    title: version?.title,
    description: version?.description ?? undefined,
    coverImage: guide.coverImage
      ? { storagePath: guide.coverImage.storagePath, publicUrl: guide.coverImage.publicUrl }
      : undefined,
    createdAt: guide.createdAt,
    updatedAt: guide.updatedAt,
    published: guide.published,
  }
}

interface GuidesListProps {
  guides?: GuideWithTranslationsAndCover[]
  isLoading?: boolean
  error?: Error | null
  onCreateGuide?: (data: {
    translations: Array<{ locale: string; title: string; description?: string }>
    organizationId?: string
    coverImage?: string
  }) => Promise<GuideWithTranslations>
  onViewGuide?: (guide: GuideWithTranslationsAndCover) => void
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
    (guide: GuideWithTranslationsAndCover) => {
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
  }, [onCreateGuide, onViewGuide])

  // Loading state
  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-9 w-40" />
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton elements
            <div
              key={`skeleton-${i}`}
              className="overflow-hidden rounded-lg border bg-card shadow-[var(--shadow-card)]"
            >
              <Skeleton className="h-44 w-full" />
              {/* CardHeader */}
              <div className="flex flex-col gap-1.5 px-6 pt-6">
                <div className="flex items-start justify-between gap-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-5 w-14 shrink-0 rounded-full" />
                </div>
              </div>
              {/* CardContent */}
              <div className="px-6 py-3 space-y-1.5">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              {/* CardFooter */}
              <div className="flex flex-col gap-3 px-6 pb-6 pt-2">
                <Skeleton className="h-8 w-24" />
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
    <div className="mx-auto w-full max-w-5xl space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <PageTitle as="h2">{t('title')}</PageTitle>
          <p className="text-sm text-muted-foreground">{t('description')}</p>
        </div>
        <Button onClick={handleCreateGuide} disabled={isCreating} className="group">
          <Plus className="transition-transform duration-200 group-hover:rotate-90" />
          {isCreating ? t('empty.creating') : t('empty.createNewButton')}
        </Button>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {guides.map((guide) => (
          <GuidePreviewCard
            key={guide.id}
            guide={toGuideForPreview(guide)}
            onViewDetails={() => handleViewGuide(guide)}
          />
        ))}
      </div>
    </div>
  )
}
