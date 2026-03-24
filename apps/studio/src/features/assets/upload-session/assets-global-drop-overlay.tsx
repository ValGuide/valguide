import { useTranslations } from '@valguide/core/i18n/client'
import { Upload } from 'lucide-react'

type AssetsGlobalDropOverlayProps = {
  open: boolean
}

export function AssetsGlobalDropOverlay({ open }: AssetsGlobalDropOverlayProps) {
  const t = useTranslations('assets.uploadSurface.overlay')

  if (!open) {
    return null
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[80] bg-background/80 backdrop-blur-sm">
      <div className="flex h-full w-full items-center justify-center p-4">
        <div className="flex w-full max-w-3xl flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-primary bg-background/95 px-8 py-16 text-center shadow-2xl">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Upload className="h-8 w-8" />
          </div>
          <p className="text-2xl font-semibold tracking-tight">{t('title')}</p>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">{t('description')}</p>
          <p className="mt-4 text-xs text-muted-foreground sm:text-sm">{t('limits')}</p>
        </div>
      </div>
    </div>
  )
}
