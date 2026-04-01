import type { EffectiveQrBranding, QrAnalyticsSummary } from '@valguide/core/features/links/qr/shared'
import { useTranslations } from '@valguide/core/i18n/client'
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@valguide/ui/components/drawer'
import { ScrollArea } from '@valguide/ui/components/scroll-area'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@valguide/ui/components/sheet'
import { useIsMobile } from '@valguide/ui/hooks/use-mobile'
import type { ReactNode } from 'react'
import { QrPreviewCard } from './qr-preview-card'

type QrManagementPanelProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  shortUrl: string
  branding: EffectiveQrBranding
  analytics?: QrAnalyticsSummary
  sourceLabel?: string
  note?: string
  children?: ReactNode
}

function QrManagementPanelContent({
  title,
  description,
  shortUrl,
  branding,
  analytics,
  sourceLabel,
  note,
  children,
}: Omit<QrManagementPanelProps, 'open' | 'onOpenChange'>) {
  const isMobile = useIsMobile()

  return (
    <>
      {isMobile ? (
        <DrawerHeader className="border-b px-4 pb-4 text-left sm:text-left">
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
      ) : (
        <SheetHeader className="border-b px-6 py-5">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
      )}

      <ScrollArea className="flex-1">
        <div className="p-4 sm:p-6">
          <QrPreviewCard
            shortUrl={shortUrl}
            branding={branding}
            analytics={analytics}
            sourceLabel={sourceLabel}
            note={note}
            variant="plain"
            showHeader={false}
            size={220}
          >
            {children}
          </QrPreviewCard>
        </div>
      </ScrollArea>
    </>
  )
}

export function QrManagementPanel(props: QrManagementPanelProps) {
  const t = useTranslations('studio.qr')
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <Drawer open={props.open} onOpenChange={props.onOpenChange}>
        <DrawerContent className="max-h-[90dvh]">
          <QrManagementPanelContent {...props} />
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Sheet open={props.open} onOpenChange={props.onOpenChange}>
      <SheetContent className="w-full p-0 sm:max-w-2xl">
        <QrManagementPanelContent {...props} title={props.title || t('manageQr')} description={props.description} />
      </SheetContent>
    </Sheet>
  )
}
