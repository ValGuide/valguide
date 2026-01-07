import { useTranslations } from '@valguide/core/i18n/client'
import { Progress } from '@valguide/ui/components/progress'

export type MediaPickerProgressProps = {
  progress: number
  fileName: string
}

export function MediaPickerProgress({ progress, fileName }: MediaPickerProgressProps) {
  const t = useTranslations('assets.mediaPicker')

  return (
    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 space-y-4">
      <div className="w-full max-w-xs space-y-2">
        <Progress value={progress} className="h-2" />
        <div className="text-center">
          <p className="text-sm font-medium">{t('uploading', { progress: Math.round(progress) })}</p>
          <p className="text-xs text-muted-foreground truncate" title={fileName}>
            {fileName}
          </p>
        </div>
      </div>
    </div>
  )
}
