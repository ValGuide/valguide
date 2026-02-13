import { useTranslations } from '@valguide/core/i18n/client'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@valguide/ui/components/dialog'
import { Link2 } from 'lucide-react'
import type { ComponentType } from 'react'

type SlugSettingsComponentProps = {
  tourNanoId: string
  tourTitle: string
  variant?: 'card' | 'plain'
  onSaved?: () => void
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
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="size-4" />
            {t('title')}
          </DialogTitle>
          <DialogDescription>{t('dialogDescription')}</DialogDescription>
        </DialogHeader>
        <SlugSettings
          tourNanoId={tourNanoId}
          tourTitle={tourTitle}
          variant="plain"
          onSaved={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
