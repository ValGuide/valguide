import { useTranslations } from '@valguide/core/i18n/client'
import { Progress } from '@valguide/ui/components/progress'
import { useGuideEditorV2 } from '@/features/guides/contexts/guide-editor-v2-types'

export function GuideProgressV2() {
  const t = useTranslations('guides.editor')
  const { metadata, localeData, stops, activeLocale } = useGuideEditorV2()

  if (!metadata) {
    return null
  }

  // Calculate progress based on:
  // 1. Guide has title
  // 2. Guide has description
  // 3. Guide has cover image
  // 4. At least one stop
  // 5. All stops have titles

  const items = [
    {
      label: t('progress.guideTitle'),
      complete: !!(
        localeData?.guideTranslation?.draftVersion?.title || localeData?.guideTranslation?.currentVersion?.title
      ),
    },
    {
      label: t('progress.guideDescription'),
      complete: !!(
        localeData?.guideTranslation?.draftVersion?.description ||
        localeData?.guideTranslation?.currentVersion?.description
      ),
    },
    {
      label: t('progress.coverImage'),
      complete: metadata.assets.some((a) => a.role === 'cover'),
    },
    {
      label: t('progress.hasStops'),
      complete: stops.length > 0,
    },
    {
      label: t('progress.allStopTitles'),
      complete:
        stops.length > 0 &&
        localeData?.stopTranslations.every((st) => !!(st.draftVersion?.title || st.currentVersion?.title)),
    },
  ]

  const completedCount = items.filter((item) => item.complete).length
  const progressPercent = Math.round((completedCount / items.length) * 100)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{t('progress.label')}</span>
        <span className="font-medium">{progressPercent}%</span>
      </div>
      <Progress value={progressPercent} className="h-2" />
      <ul className="space-y-2 text-sm">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${item.complete ? 'bg-green-500' : 'bg-muted-foreground/30'}`} />
            <span className={item.complete ? 'text-foreground' : 'text-muted-foreground'}>{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
