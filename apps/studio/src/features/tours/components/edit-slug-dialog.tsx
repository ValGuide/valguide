import { useTranslations } from '@valguide/core/i18n/client'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@valguide/ui/components/dialog'
import type { ComponentType } from 'react'

type SlugSettingsComponentProps = {
  tourNanoId: string
  tourTitle: string
}

export type EditSlugDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  tourNanoId: string
  tourTitle: string
  SlugSettings: ComponentType<SlugSettingsComponentProps>
}

export function EditSlugDialog({ open, onOpenChange, tourNanoId, tourTitle, SlugSettings }: EditSlugDialogProps) {
  const t = useTranslations('tours.editor.slug')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="sr-only">
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('title')}</DialogDescription>
        </DialogHeader>
        <SlugSettings tourNanoId={tourNanoId} tourTitle={tourTitle} />
      </DialogContent>
    </Dialog>
  )
}
