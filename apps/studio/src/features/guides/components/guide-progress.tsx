import type { GuideWithStopsAndAssets } from '@valguide/core/features/guides/queries'
import { getVersionedField } from '@valguide/core/features/guides/utils'
import { useTranslations } from '@valguide/core/i18n/client'
import { Progress } from '@valguide/ui/components/progress'
import { Separator } from '@valguide/ui/components/separator'
import { AlertCircle, CheckCircle2, Circle } from 'lucide-react'
import { useMemo } from 'react'
import {
  getGuideLocaleSummary,
  getOverallTranslationProgress,
  type TranslationLocaleStatus,
} from '../utils/translation-status'
import { getLocaleDisplayName } from './locale-selector'

interface GuideProgressProps {
  guide: GuideWithStopsAndAssets
  locale: string
}

interface ProgressItem {
  labelKey: string
  completed: boolean
}

function StatusIcon({ status }: { status: TranslationLocaleStatus }) {
  switch (status) {
    case 'published':
      return <Circle className="h-2.5 w-2.5 fill-green-500 text-green-500" />
    case 'draft':
      return <Circle className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
    case 'empty':
      return <Circle className="h-2.5 w-2.5 fill-muted-foreground/30 text-muted-foreground/30" />
  }
}

export function GuideProgress({ guide, locale }: GuideProgressProps) {
  const t = useTranslations('guides.progress')
  const translation = guide.translations.find((t) => t.locale === locale)

  const { stopsWithDrafts, guideHasDraft, summary } = useMemo(() => {
    const stopsWithDrafts = guide.stops.filter((stop) => {
      const stopTranslation = stop.translations.find((t) => t.locale === locale)
      return !!stopTranslation?.draftVersionId
    })
    const guideHasDraft = !!translation?.draftVersionId
    const summary = getGuideLocaleSummary(guide, locale)
    return { stopsWithDrafts, guideHasDraft, summary }
  }, [guide, locale, translation?.draftVersionId])

  const overallProgress = useMemo(() => getOverallTranslationProgress(guide), [guide])

  const items: ProgressItem[] = [
    {
      labelKey: 'titleAdded',
      completed: !!getVersionedField(translation, 'title'),
    },
    {
      labelKey: 'descriptionAdded',
      completed: !!getVersionedField(translation, 'description'),
    },
    {
      labelKey: 'coverImageAdded',
      completed: !!guide.assets?.find((a) => a.role === 'cover'),
    },
    {
      labelKey: 'atLeastOneStop',
      completed: guide.stops.length > 0,
    },
    {
      labelKey: 'allStopsHaveTitles',
      completed:
        guide.stops.length > 0 &&
        guide.stops.every((stop) => {
          const stopTranslation = stop.translations.find((t) => t.locale === locale)
          return !!getVersionedField(stopTranslation, 'title')
        }),
    },
  ]

  const completedCount = items.filter((item) => item.completed).length
  const totalCount = items.length
  const progressPercentage = (completedCount / totalCount) * 100

  return (
    <div className="space-y-4">
      {/* Current Language Status */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">{t('currentLanguage', { language: getLocaleDisplayName(locale) })}</h4>
          <StatusIcon status={summary.guideStatus} />
        </div>

        {/* Guide Status */}
        <div className="rounded-lg border p-3">
          <div className="flex items-center justify-between text-sm">
            <span>{t('guideStatus')}</span>
            <span className="capitalize text-muted-foreground">{t(`status.${summary.guideStatus}`)}</span>
          </div>
        </div>

        {/* Stops Breakdown */}
        {guide.stops.length > 0 && (
          <div className="rounded-lg border p-3 space-y-2">
            <div className="text-sm font-medium">{t('stopsBreakdown', { total: summary.totalStops })}</div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="flex items-center gap-1.5">
                <Circle className="h-2 w-2 fill-green-500 text-green-500" />
                <span className="text-muted-foreground">
                  {t('published')}: {summary.stopsPublished}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Circle className="h-2 w-2 fill-amber-500 text-amber-500" />
                <span className="text-muted-foreground">
                  {t('draft')}: {summary.stopsDraft}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Circle className="h-2 w-2 fill-muted-foreground/30 text-muted-foreground/30" />
                <span className="text-muted-foreground">
                  {t('notStarted')}: {summary.stopsEmpty}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <Separator />

      {/* Guide Completion Checklist */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">{t('title')}</h4>
          <span className="text-xs text-muted-foreground">
            {t('count', { completed: completedCount, total: totalCount })}
          </span>
        </div>

        <Progress value={progressPercentage} className="h-2" />

        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.labelKey} className="flex items-center gap-2 text-sm">
              {item.completed ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground" />
              )}
              <span className={item.completed ? 'text-foreground' : 'text-muted-foreground'}>{t(item.labelKey)}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Unpublished Changes Section */}
      <div className="space-y-3 border-t pt-4">
        <h4 className="text-sm font-medium">{t('unpublishedChanges')}</h4>
        {guideHasDraft || stopsWithDrafts.length > 0 ? (
          <ul className="space-y-2">
            {guideHasDraft && (
              <li className="flex items-center gap-2 text-sm">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <span className="text-muted-foreground">{t('guideDraft')}</span>
              </li>
            )}
            {stopsWithDrafts.length > 0 && (
              <li className="flex items-center gap-2 text-sm">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <span className="text-muted-foreground">{t('stopsWithDrafts', { count: stopsWithDrafts.length })}</span>
              </li>
            )}
          </ul>
        ) : (
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span className="text-muted-foreground">{t('allPublished')}</span>
          </div>
        )}
      </div>

      <Separator />

      {/* All Languages Overview */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium">{t('allLanguages')}</h4>
        <div className="flex items-center gap-2">
          <Progress
            value={(overallProgress.translatedLocales / overallProgress.totalLocales) * 100}
            className="h-2 flex-1"
          />
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {t('translatedCount', {
              translated: overallProgress.translatedLocales,
              total: overallProgress.totalLocales,
            })}
          </span>
        </div>
      </div>
    </div>
  )
}
