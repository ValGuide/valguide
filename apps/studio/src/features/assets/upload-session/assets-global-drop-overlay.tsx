import { useTranslations } from '@valguide/core/i18n/client'
import { ArrowUp } from 'lucide-react'

type AssetsGlobalDropOverlayProps = {
  open: boolean
}

export function AssetsGlobalDropOverlay({ open }: AssetsGlobalDropOverlayProps) {
  const t = useTranslations('assets.uploadSurface.overlay')

  if (!open) {
    return null
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[80] animate-in fade-in duration-200 bg-background/95">
      <div className="absolute inset-4 rounded-2xl ring-2 ring-primary/25 animate-in fade-in zoom-in-95 duration-300" />
      <div className="flex h-full w-full flex-col items-center justify-center px-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary sm:mb-5 sm:h-14 sm:w-14">
          <ArrowUp className="h-6 w-6 animate-bounce sm:h-7 sm:w-7" strokeWidth={2.5} />
        </div>
        <p className="text-2xl font-bold tracking-tight sm:text-3xl">{t('title')}</p>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">{t('description')}</p>
      </div>
    </div>
  )
}
