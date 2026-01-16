import { Image } from '@unpic/react'
import { getAssetImageUrl } from '@valguide/core/features/assets/image-url'
import type { GuideWithTranslationsAndCover } from '@valguide/core/features/guides/types'
import { getVersionedField } from '@valguide/core/features/guides/utils'
import { useLocale, useTranslations } from '@valguide/core/i18n/client'
import { Button } from '@valguide/ui/components/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@valguide/ui/components/card'
import { StatusBadge } from '@valguide/ui/components/status-badge'
import { ImageIcon, RotateCcw, Trash2 } from 'lucide-react'

interface ArchivedGuidesListContentProps {
  guides: GuideWithTranslationsAndCover[]
  onRecover: (guideId: string, guideName: string) => void
  onDelete: (guideId: string, guideName: string) => void
}

export function ArchivedGuidesListContent({ guides, onRecover, onDelete }: ArchivedGuidesListContentProps) {
  const t = useTranslations('guides')
  const locale = useLocale()

  const formatDate = (date?: Date | string) => {
    if (!date) return ''
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(date))
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {guides.map((guide) => {
        const translation = guide.translations?.find((t) => t.locale === locale) ?? guide.translations?.[0]
        const displayTitle = getVersionedField(translation, 'title') || t('untitledGuide')
        const displayDescription = getVersionedField(translation, 'description')
        const displayImage = guide.coverImage ? getAssetImageUrl(guide.coverImage) : undefined

        return (
          <Card key={guide.id} className="flex h-full flex-col overflow-hidden">
            <div className="relative h-44 w-full shrink-0 overflow-hidden">
              {displayImage ? (
                <Image
                  src={displayImage}
                  alt={displayTitle}
                  layout="fullWidth"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-muted/30 px-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800/50">
                    <ImageIcon className="h-7 w-7 text-slate-400 dark:text-slate-500" />
                  </div>
                  <p className="text-xs text-muted-foreground/70">{t('noCoverImage')}</p>
                </div>
              )}
            </div>
            <CardHeader className="pb-0">
              <CardTitle className="flex items-start justify-between gap-3">
                <span className="line-clamp-2 flex-1 break-all text-base font-semibold leading-snug">
                  {displayTitle}
                </span>
                <StatusBadge status="archived" size="sm" className="mt-0.5 shrink-0">
                  {t('archivedStatus')}
                </StatusBadge>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 py-3">
              {displayDescription ? (
                <p className="line-clamp-2 text-sm text-muted-foreground">{displayDescription}</p>
              ) : (
                <p className="text-sm italic text-muted-foreground/50">{t('noDescription')}</p>
              )}
            </CardContent>
            <CardFooter className="flex-col items-stretch gap-3 pt-0">
              <div className="flex flex-col gap-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onRecover(guide.id, displayTitle)}
                  className="w-full"
                >
                  <RotateCcw className="h-4 w-4 shrink-0" />
                  {t('recoverGuide')}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(guide.id, displayTitle)}
                  className="w-full text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 shrink-0" />
                  {t('permanentlyDelete')}
                </Button>
              </div>
              <span className="text-xs text-muted-foreground/70">
                {t('archivedOnDate', { date: formatDate(guide.archivedAt ?? undefined) })}
              </span>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}
