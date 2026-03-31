import { useTranslations } from '@valguide/core/i18n/client'
import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from '@valguide/ui/components/responsive-dialog'
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
    <ResponsiveDialog open={open} onOpenChange={onOpenChange} mobileVariant="sheet">
      <ResponsiveDialogContent className="flex min-h-0 flex-col sm:max-w-lg">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle className="flex items-center gap-2">
            <Link2 className="size-4" />
            {t('title')}
          </ResponsiveDialogTitle>
          <ResponsiveDialogDescription>{t('dialogDescription')}</ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        <ResponsiveDialogBody className="py-4">
          <SlugSettings
            tourNanoId={tourNanoId}
            tourTitle={tourTitle}
            variant="plain"
            onSaved={() => onOpenChange(false)}
          />
        </ResponsiveDialogBody>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  )
}
