import { Link } from '@tanstack/react-router'
import { getAssetImageUrl } from '@valguide/core/features/assets/image-url'
import { getTourStatus } from '@valguide/core/features/tours/status-utils'
import { useLocale, useTranslations } from '@valguide/core/i18n/client'
import { Button } from '@valguide/core/ui/components/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@valguide/core/ui/components/card'
import { RevealImage } from '@valguide/core/ui/components/reveal-image'
import { StatusBadge } from '@valguide/core/ui/components/status-badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@valguide/core/ui/components/tooltip'
import { cn } from '@valguide/core/ui/lib/utils'
import { ImageIcon, LucideInfo } from 'lucide-react'
import * as React from 'react'
import { z } from 'zod'

// ============================================================================
// Tour Display Types (View Model for Preview Cards)
// ============================================================================

const tourTranslationFormSchema = z.object({
  id: z.string(),
  tourId: z.string(),
  locale: z.string(),
  title: z.string(),
  description: z.string().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

const coverImageSchema = z
  .object({
    storagePath: z.string(),
  })
  .nullable()
  .optional()

/**
 * Zod schema for tour display/preview cards.
 * This is NOT the same as the DB entity - it's a view model with resolved fields.
 */
export const tourDisplaySchema = z.object({
  id: z.string(),
  nanoId: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  coverImage: coverImageSchema,
  author: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  published: z.date().nullable().optional(),
  tags: z.array(z.string()).optional(),
  translations: z.array(tourTranslationFormSchema).optional(),
})

/** Tour display type for preview cards (view model, not DB entity) */
export type Tour = z.infer<typeof tourDisplaySchema>

export interface TourPreviewCardProps extends React.HTMLAttributes<HTMLDivElement> {
  tour: Tour
  onViewDetails?: (tour: Tour) => void
  className?: string
  imagePriority?: boolean
}

export function TourPreviewCard({
  tour,
  onViewDetails,
  className,
  imagePriority = false,
  ...props
}: TourPreviewCardProps) {
  // i18n-used-keys: tour.previewCard.published, tour.previewCard.unpublished
  const t = useTranslations('tour.previewCard')
  const locale = useLocale()

  const formatDate = (date?: Date | string) => {
    if (!date) return ''
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(date))
  }

  const translation = React.useMemo(() => {
    const localeTranslation = tour.translations?.find((t) => t.locale === locale)
    return localeTranslation || tour.translations?.[0]
  }, [tour.translations, locale])

  const displayTitle = translation?.title || tour.title || 'Untitled Tour'
  const displayImage = tour.imageUrl ?? (tour.coverImage ? getAssetImageUrl(tour.coverImage) : undefined)
  const tourLinkOptions = tour.nanoId
    ? ({ to: '/tours/$nanoId', params: { nanoId: tour.nanoId } } as const)
    : ({ to: '/' } as const)

  const tourStatus = getTourStatus({ publishedAt: tour.published ?? null, archivedAt: null })

  return (
    <Card
      className={cn(
        'group overflow-hidden flex flex-col h-full hover:-translate-y-0.5 hover:shadow-(--shadow-card-hover) hover:border-primary/20',
        className,
      )}
      {...props}
    >
      {/* Cover Image - Fixed Height */}
      <div className="relative h-44 w-full overflow-hidden shrink-0 bg-muted/30">
        {displayImage ? (
          <RevealImage
            src={displayImage}
            alt={displayTitle}
            layout="fullWidth"
            width={800}
            height={176}
            priority={imagePriority}
            className="group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-muted/30 px-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-br from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30">
              <ImageIcon className="h-7 w-7 text-amber-600 dark:text-amber-400" />
            </div>
            <p className="text-xs text-muted-foreground/70">{t('addCoverImage')}</p>
          </div>
        )}
      </div>

      {/* Header with Title and Badge */}
      <CardHeader className="pb-0">
        <CardTitle className="flex items-start justify-between gap-3">
          <span className="line-clamp-2 text-base font-semibold leading-snug flex-1">{displayTitle}</span>
          <StatusBadge
            status={tourStatus === 'unpublished' ? 'draft' : tourStatus}
            size="sm"
            className="shrink-0 mt-0.5"
          >
            {t(tourStatus === 'archived' ? 'unpublished' : tourStatus)}
          </StatusBadge>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 py-3" />

      {/* Footer - Consistent Position */}
      <CardFooter className="flex-col items-stretch gap-3 pt-0">
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" asChild>
            <Link {...tourLinkOptions} preload="intent">
              {t('viewDetails')}
            </Link>
          </Button>
          {tour.author && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <LucideInfo className="h-3.5 w-3.5" />
                    <span className="sr-only">{t('authorInfo')}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {t('author')}: {tour.author}
                  </p>
                  {tour.createdAt && (
                    <p>
                      {t('created')}: {formatDate(tour.createdAt)}
                    </p>
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        {tour.updatedAt && (
          <span className="text-xs text-muted-foreground/70">
            {t('updated')}: {formatDate(tour.updatedAt)}
          </span>
        )}
      </CardFooter>
    </Card>
  )
}
