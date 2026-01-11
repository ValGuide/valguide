import type { GuideWithStopsAndAssets } from '@valguide/core/features/guides/types'
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
    <div className="space-y-5">
      {/* Current Language Status */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-medium text-muted-foreground">
            {t('currentLanguage', { language: getLocaleDisplayName(locale) })}
          </h4>
          <StatusIcon status={summary.guideStatus} />
        </div>

        {/* Guide Status */}
        <div className="rounded-md border bg-muted/20 p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t('guideStatus')}</span>
            <span className="capitalize font-medium text-foreground">{t(`status.${summary.guideStatus}`)}</span>
          </div>
        </div>

        {/* Stops Breakdown */}
        {guide.stops.length > 0 && (
          <div className="rounded-md border bg-muted/20 p-3 space-y-2">
            <div className="text-xs font-medium text-muted-foreground">
              {t('stopsBreakdown', { total: summary.totalStops })}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
              <div className="flex items-center gap-1.5">
                <Circle className="h-2 w-2 fill-emerald-500 text-emerald-500" />
                <span className="text-muted-foreground">
                  {t('published')}: <span className="font-medium text-foreground">{summary.stopsPublished}</span>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Circle className="h-2 w-2 fill-amber-500 text-amber-500" />
                <span className="text-muted-foreground">
                  {t('draft')}: <span className="font-medium text-foreground">{summary.stopsDraft}</span>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Circle className="h-2 w-2 fill-muted-foreground/40 text-muted-foreground/40" />
                <span className="text-muted-foreground">
                  {t('notStarted')}: <span className="font-medium text-foreground">{summary.stopsEmpty}</span>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <Separator className="opacity-50" />

      {/* Guide Completion Checklist */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-medium text-muted-foreground">{t('title')}</h4>
          <span className="text-xs font-medium">
            {completedCount}/{totalCount}
          </span>
        </div>

        <Progress value={progressPercentage} className="h-1.5" />

        <ul className="space-y-1.5">
          {items.map((item) => (
            <li key={item.labelKey} className="flex items-center gap-2 text-xs">
              {item.completed ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              ) : (
                <Circle className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
              )}
              <span className={item.completed ? 'text-foreground' : 'text-muted-foreground'}>{t(item.labelKey)}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Unpublished Changes Section */}
      <div className="space-y-2 border-t pt-4">
        <h4 className="text-xs font-medium text-muted-foreground">{t('unpublishedChanges')}</h4>
        {guideHasDraft || stopsWithDrafts.length > 0 ? (
          <ul className="space-y-1.5">
            {guideHasDraft && (
              <li className="flex items-center gap-2 text-xs">
                <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <span className="text-muted-foreground">{t('guideDraft')}</span>
              </li>
            )}
            {stopsWithDrafts.length > 0 && (
              <li className="flex items-center gap-2 text-xs">
                <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <span className="text-muted-foreground">{t('stopsWithDrafts', { count: stopsWithDrafts.length })}</span>
              </li>
            )}
          </ul>
        ) : (
          <div className="flex items-center gap-2 text-xs">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span className="text-muted-foreground">{t('allPublished')}</span>
          </div>
        )}
      </div>

      <Separator className="opacity-50" />

      {/* All Languages Overview */}
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-muted-foreground">{t('allLanguages')}</h4>
        <div className="flex items-center gap-3">
          <Progress
            value={(overallProgress.translatedLocales / overallProgress.totalLocales) * 100}
            className="h-1.5 flex-1"
          />
          <span className="text-xs font-medium whitespace-nowrap">
            {overallProgress.translatedLocales}/{overallProgress.totalLocales}
          </span>
        </div>
      </div>
    </div>
  )
}
