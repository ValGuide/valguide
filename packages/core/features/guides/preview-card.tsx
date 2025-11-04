import * as React from 'react'
import { useTranslations } from 'next-intl'
import { LucideInfo } from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@valguide/core/ui/components/card'
import { Badge } from '@valguide/core/ui/components/badge'
import { cn } from '@valguide/core/ui/lib/utils'
import { Button } from '@valguide/core/ui/components/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@valguide/core/ui/components/tooltip'

import { Guide } from './types'

export interface GuidePreviewCardProps extends React.HTMLAttributes<HTMLDivElement> {
  guide: Guide
  onViewDetails?: (guide: Guide) => void
  className?: string
}

export function GuidePreviewCard({ guide, onViewDetails, className, ...props }: GuidePreviewCardProps) {
  const t = useTranslations('guide.previewCard')

  const handleViewDetails = React.useCallback(() => {
    onViewDetails?.(guide)
  }, [guide, onViewDetails])

  const formatDate = (date?: Date) => {
    if (!date) return ''
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date)
  }

  return (
    <Card className={cn('overflow-hidden transition-all hover:shadow-md', className)} {...props}>
      {guide.imageUrl && (
        <div className="relative h-48 w-full overflow-hidden">
          <img
            src={guide.imageUrl}
            alt={guide.title}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
      )}
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{guide.title}</span>
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
        {guide.description && <CardDescription>{guide.description}</CardDescription>}
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
        <Button variant="outline" onClick={handleViewDetails}>
          {t('viewDetails')}
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
