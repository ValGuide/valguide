import { Badge } from '@valguide/core/ui/components/badge'
import { Button } from '@valguide/core/ui/components/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@valguide/core/ui/components/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@valguide/core/ui/components/tooltip'
import { cn } from '@valguide/core/ui/lib/utils'
import { Link } from '@tanstack/react-router'
import { ImageIcon, LucideInfo } from 'lucide-react'
import { useLocale, useTranslations } from '@valguide/core/i18n/mock'
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

  const _handleViewDetails = React.useCallback(() => {
    onViewDetails?.(guide)
  }, [guide, onViewDetails])

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
  const displayImage = guide.imageUrl
  const guideUrl = guide.nanoId ? `/guides/${guide.nanoId}` : '#'

  const isPublished = !!guide.published
  const status = isPublished ? 'published' : 'draft'

  return (
    <Card
      className={cn(
        'overflow-hidden transition-all duration-200',
        'hover:-translate-y-0.5 hover:shadow-lg hover:border-primary/30',
        className,
      )}
      {...props}
    >
      <div className="relative h-48 w-full overflow-hidden">
        {displayImage ? (
          // biome-ignore lint/performance/noImgElement: Using img for dynamic content
          <img
            src={displayImage}
            alt={displayTitle}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-muted/40 px-4 py-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30">
              <ImageIcon className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="text-center">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t('coverImage')}</p>
              <p className="mt-1 text-xs text-muted-foreground/70">{t('addCoverImage')}</p>
            </div>
          </div>
        )}
      </div>
      <CardHeader className="space-y-2">
        <CardTitle className="flex items-start justify-between gap-2">
          <span className="line-clamp-2 text-base font-semibold leading-snug">{displayTitle}</span>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <Badge
              variant="outline"
              className={cn(
                'text-[11px] uppercase tracking-wide',
                status === 'published' &&
                  'border-emerald-500/50 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400',
                status === 'draft' &&
                  'border-slate-400/50 bg-slate-50 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400',
              )}
            >
              {t(status)}
            </Badge>
          </div>
        </CardTitle>
        {displayDescription && (
          <div className="text-sm text-muted-foreground">
            <RichTextDisplay content={displayDescription} className="line-clamp-2" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-1.5">
          {guide.tags?.map((tag) => (
            <Badge key={tag} variant="outline" className="text-[11px]">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-stretch gap-3">
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
          <span className="text-xs text-muted-foreground">
            {t('updated')}: {formatDate(guide.updatedAt)}
          </span>
        )}
      </CardFooter>
    </Card>
  )
}
