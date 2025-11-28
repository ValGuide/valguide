import { Badge } from '@valguide/core/ui/components/badge'
import { Button } from '@valguide/core/ui/components/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@valguide/core/ui/components/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@valguide/core/ui/components/tooltip'
import { cn } from '@valguide/core/ui/lib/utils'
import { Link } from '@valguide/i18n/routing'
import { LucideInfo } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
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

  // Get the translation in the current locale or fall back to the first available translation
  const translation = React.useMemo(() => {
    const localeTranslation = guide.translations?.find((t) => t.locale === locale)
    return localeTranslation || guide.translations?.[0]
  }, [guide.translations, locale])

  const displayTitle = translation?.title || guide.title || 'Untitled Guide'
  const displayDescription = translation?.description || guide.description || ''
  const displayImage = guide.coverImage || guide.imageUrl
  const guideUrl = guide.nanoId ? `/guides/${guide.nanoId}` : '#'

  return (
    <Card className={cn('overflow-hidden transition-all hover:shadow-md', className)} {...props}>
      {displayImage && (
        <div className="relative h-48 w-full overflow-hidden">
          {/* biome-ignore lint/performance/noImgElement: Using img for dynamic content */}
          <img
            src={displayImage}
            alt={displayTitle}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
      )}
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{displayTitle}</span>
          {guide.author && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <LucideInfo className="h-4 w-4" />
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
        </CardTitle>
        {displayDescription && (
          <div className="text-sm text-muted-foreground">
            <RichTextDisplay content={displayDescription} className="line-clamp-3" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {guide.tags?.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" asChild>
          <Link href={guideUrl} prefetch={true}>
            {t('viewDetails')}
          </Link>
        </Button>
        {guide.updatedAt && (
          <span className="text-xs text-muted-foreground">
            {t('updated')}: {formatDate(guide.updatedAt)}
          </span>
        )}
      </CardFooter>
    </Card>
  )
}
