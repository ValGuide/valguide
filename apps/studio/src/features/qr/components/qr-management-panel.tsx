import type { EffectiveQrBranding } from '@valguide/core/features/links/qr/shared'
import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogContent,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from '@valguide/core/ui/components/responsive-dialog'
import { ScrollArea } from '@valguide/ui/components/scroll-area'
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle } from '@valguide/ui/components/sheet'
import { useIsMobile } from '@valguide/ui/hooks/use-mobile'
import { cn } from '@valguide/ui/lib/utils'
import { XIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { QrPreviewCard } from './qr-preview-card'

type QrManagementPanelProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  shortUrl: string
  branding: EffectiveQrBranding
  downloadFileName?: string
  sourceLabel?: string
  note?: string
  children?: ReactNode
  footer?: ReactNode
}

const panelCloseButtonClassName = cn(
  'ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground',
  'flex size-10 shrink-0 items-center justify-center rounded-full bg-background/95 opacity-85 transition-[opacity,background-color]',
  'hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none',
  '[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=size-])]:size-5',
)

function QrManagementPanelSections({
  title,
  description,
  shortUrl,
  branding,
  downloadFileName,
  children,
}: Omit<QrManagementPanelProps, 'open' | 'onOpenChange' | 'footer'>) {
  return (
    <div className="min-w-0 space-y-6 overflow-x-hidden p-4 sm:p-6">
      <QrPreviewCard
        title={title}
        description={description}
        shortUrl={shortUrl}
        branding={branding}
        downloadFileName={downloadFileName}
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
      <ResponsiveDialog open={props.open} onOpenChange={props.onOpenChange}>
        <ResponsiveDialogContent className="flex min-h-0 flex-col sm:max-w-2xl">
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>{props.title}</ResponsiveDialogTitle>
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
      <SheetContent className="flex h-full w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl [&_[data-slot=sheet-close]]:hidden">
        <SheetHeader className="border-b px-6 py-5 text-left">
          <div className="flex items-center justify-between gap-4">
            <SheetTitle>{props.title}</SheetTitle>
            <SheetClose className={panelCloseButtonClassName}>
              <XIcon />
              <span className="sr-only">Close</span>
            </SheetClose>
          </div>
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
