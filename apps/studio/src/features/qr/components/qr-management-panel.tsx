import type { EffectiveQrBranding } from '@valguide/core/features/links/qr/shared'
import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from '@valguide/core/ui/components/responsive-dialog'
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
  sourceLabel?: string
  note?: string
  children?: ReactNode
  footer?: ReactNode
}

function QrManagementPanelSections({
  title,
  description,
  shortUrl,
  branding,
  children,
}: Omit<QrManagementPanelProps, 'open' | 'onOpenChange' | 'footer'>) {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      <QrPreviewCard
        title={title}
        description={description}
        shortUrl={shortUrl}
        branding={branding}
        variant="plain"
        showHeader={false}
        showShortUrl={false}
        showActions={false}
        showSourceLabel={false}
        showNote={false}
        size={184}
      />

      {children ? <section className="space-y-4">{children}</section> : null}
    </div>
  )
}

export function QrManagementPanel(props: QrManagementPanelProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <ResponsiveDialog open={props.open} onOpenChange={props.onOpenChange} mobileVariant="full-height">
        <ResponsiveDialogContent className="flex min-h-0 flex-col sm:max-w-2xl">
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>{props.title}</ResponsiveDialogTitle>
            <ResponsiveDialogDescription>{props.description}</ResponsiveDialogDescription>
          </ResponsiveDialogHeader>
          <ResponsiveDialogBody className="min-h-0 px-0 py-0">
            <QrManagementPanelSections {...props} />
          </ResponsiveDialogBody>
          {props.footer ? <ResponsiveDialogFooter>{props.footer}</ResponsiveDialogFooter> : null}
        </ResponsiveDialogContent>
      </ResponsiveDialog>
    )
  }

  return (
    <Sheet open={props.open} onOpenChange={props.onOpenChange}>
      <SheetContent className="flex h-full w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <SheetHeader className="border-b px-6 py-5 text-left">
          <SheetTitle>{props.title}</SheetTitle>
          <SheetDescription>{props.description}</SheetDescription>
        </SheetHeader>
        <ScrollArea className="min-h-0 flex-1">
          <QrManagementPanelSections {...props} />
        </ScrollArea>
        {props.footer ? (
          <div className="border-t bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/85 sm:px-6">
            {props.footer}
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
