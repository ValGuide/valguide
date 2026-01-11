import { Link } from '@tanstack/react-router'
import { Image } from '@unpic/react'
import { getAssetImageUrl } from '@valguide/core/features/assets/image-url'
import { useLocale, useTranslations } from '@valguide/core/i18n/client'
import { Button } from '@valguide/core/ui/components/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@valguide/core/ui/components/card'
import { StatusBadge } from '@valguide/core/ui/components/status-badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@valguide/core/ui/components/tooltip'
import { cn } from '@valguide/core/ui/lib/utils'
import { ImageIcon, LucideInfo } from 'lucide-react'
import * as React from 'react'
import { RichTextDisplay } from './rich-text-display'

import type { Guide } from './types'

export interface GuidePreviewCardProps extends React.HTMLAttributes<HTMLDivElement> {
  guide: Guide
  onViewDetails?: (guide: Guide) => void
  className?: string
}

export function GuidePreviewCard({ guide, onViewDetails, className, ...props }: GuidePreviewCardProps) {
  const t = useTranslations('guide.previewCard')
  const locale = useLocale()

  const formatDate = (date?: Date | string) => {
    if (!date) return ''
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(date))
  }

  const translation = React.useMemo(() => {
    const localeTranslation = guide.translations?.find((t) => t.locale === locale)
    return localeTranslation || guide.translations?.[0]
  }, [guide.translations, locale])

  const displayTitle = translation?.title || guide.title || 'Untitled Guide'
  const displayDescription = translation?.description || guide.description || ''
  const displayImage = guide.coverImage ? getAssetImageUrl(guide.coverImage) : guide.imageUrl
  const guideUrl = guide.nanoId ? `/guides/${guide.nanoId}` : '#'

  const isPublished = !!guide.published
  const status = isPublished ? 'published' : 'draft'

  return (
    <Card
      className={cn(
        'overflow-hidden flex flex-col h-full hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)] hover:border-primary/20',
        className,
      )}
      {...props}
    >
      {/* Cover Image - Fixed Height */}
      <div className="relative h-44 w-full overflow-hidden shrink-0">
        {displayImage ? (
          <Image
            src={displayImage}
            alt={displayTitle}
            layout="fullWidth"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-muted/30 px-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30">
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
          <StatusBadge status={status} size="sm" className="shrink-0 mt-0.5">
            {t(status)}
          </StatusBadge>
        </CardTitle>
      </CardHeader>

      {/* Description - Clamped */}
      <CardContent className="flex-1 py-3">
        {displayDescription ? (
          <div className="text-sm text-muted-foreground line-clamp-2">
            <RichTextDisplay content={displayDescription} />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground/50 italic">{t('noDescription')}</p>
        )}
      </CardContent>

      {/* Footer - Consistent Position */}
      <CardFooter className="flex-col items-stretch gap-3 pt-0">
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" asChild>
            <Link to={guideUrl} preload="intent">
              {t('viewDetails')}
            </Link>
          </Button>
          {guide.author && (
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
                    {t('author')}: {guide.author}
                  </p>
                  {guide.createdAt && (
                    <p>
                      {t('created')}: {formatDate(guide.createdAt)}
                    </p>
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        {guide.updatedAt && (
          <span className="text-xs text-muted-foreground/70">
            {t('updated')}: {formatDate(guide.updatedAt)}
          </span>
        )}
      </CardFooter>
    </Card>
  )
}
