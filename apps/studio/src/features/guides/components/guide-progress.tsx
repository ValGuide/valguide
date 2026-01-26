import { useTranslations } from '@valguide/core/i18n/client'
import { Progress } from '@valguide/ui/components/progress'
import { useGuideEditor } from '@/features/guides/contexts/guide-editor-types'

export function GuideProgress() {
  const t = useTranslations('guides.editor')
  const { guideDetail, localeDraft, stops, guideAssets } = useGuideEditor()

  if (!guideDetail) {
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
      complete: !!localeDraft?.title,
    },
    {
      label: t('progress.guideDescription'),
      complete: !!localeDraft?.description,
    },
    {
      label: t('progress.coverImage'),
      complete: guideAssets.some((a) => a.role === 'cover'),
    },
    {
      label: t('progress.hasStops'),
      complete: stops.length > 0,
    },
    {
      label: t('progress.allStopTitles'),
      complete: stops.length > 0 && stops.every((stop) => !!stop.title),
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
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${item.complete ? 'bg-green-500' : 'bg-muted-foreground/30'}`} />
            <span className={item.complete ? 'text-foreground' : 'text-muted-foreground'}>{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
