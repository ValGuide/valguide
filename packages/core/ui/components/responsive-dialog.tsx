import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@valguide/ui/components/dialog'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@valguide/ui/components/drawer'
import { useIsMobile } from '@valguide/ui/hooks/use-mobile'
import { cn } from '@valguide/ui/lib/utils'
import { XIcon } from 'lucide-react'
import * as React from 'react'

type ResponsiveDialogMobileVariant = 'sheet' | 'full-height'

type ResponsiveDialogContextValue = {
  isMobile: boolean
  mobileVariant: ResponsiveDialogMobileVariant
}

const ResponsiveDialogContext = React.createContext<ResponsiveDialogContextValue | null>(null)

function useResponsiveDialogContext() {
  const context = React.useContext(ResponsiveDialogContext)

  if (!context) {
    throw new Error('Responsive dialog components must be used within <ResponsiveDialog>.')
  }

  return context
}

function ResponsiveDialog({
  mobileVariant = 'sheet',
  ...props
}: React.ComponentProps<typeof Dialog> & {
  mobileVariant?: ResponsiveDialogMobileVariant
}) {
  const isMobile = useIsMobile()
  const contextValue = React.useMemo(
    () => ({
      isMobile,
      mobileVariant,
    }),
    [isMobile, mobileVariant],
  )

  if (isMobile) {
    return (
      <ResponsiveDialogContext.Provider value={contextValue}>
        <Drawer open={props.open} onOpenChange={props.onOpenChange} dismissible={props.modal ?? true}>
          {props.children}
        </Drawer>
      </ResponsiveDialogContext.Provider>
    )
  }

  return (
    <ResponsiveDialogContext.Provider value={contextValue}>
      <Dialog {...props} />
    </ResponsiveDialogContext.Provider>
  )
}

function ResponsiveDialogTrigger(props: React.ComponentProps<typeof DialogTrigger>) {
  const { isMobile } = useResponsiveDialogContext()

  return isMobile ? <DrawerTrigger {...props} /> : <DialogTrigger {...props} />
}

function ResponsiveDialogClose(props: React.ComponentProps<typeof DialogClose>) {
  const { isMobile } = useResponsiveDialogContext()

  return isMobile ? <DrawerClose {...props} /> : <DialogClose {...props} />
}

function ResponsiveDialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogContent> & {
  showCloseButton?: boolean
}) {
  const { isMobile, mobileVariant } = useResponsiveDialogContext()

  if (isMobile) {
    return (
      <DrawerContent
        showHandle={mobileVariant !== 'full-height'}
        className={cn(
          className,
          '!w-full !max-w-none overflow-hidden border-0 bg-background p-0 sm:!w-full sm:!max-w-none',
          mobileVariant === 'full-height'
            ? '!mt-0 !h-dvh !max-h-dvh !rounded-none sm:!h-dvh sm:!max-h-dvh sm:!rounded-none'
            : '!h-[min(90dvh,48rem)] !max-h-[90dvh] !rounded-t-[1.25rem] sm:!h-[min(90dvh,48rem)] sm:!max-h-[90dvh] sm:!rounded-t-[1.25rem]',
        )}
        {...props}
      >
        {mobileVariant === 'full-height' && showCloseButton ? (
          <DrawerClose className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 z-10 flex size-9 items-center justify-center rounded-full bg-background/95 opacity-85 transition-[opacity,background-color] hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4.5">
            <XIcon />
            <span className="sr-only">Close</span>
          </DrawerClose>
        ) : null}
        {children}
      </DrawerContent>
    )
  }

  return (
    <DialogContent className={className} showCloseButton={showCloseButton} {...props}>
      {children}
    </DialogContent>
  )
}

function ResponsiveDialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  const { isMobile, mobileVariant } = useResponsiveDialogContext()

  if (isMobile) {
    return (
      <DrawerHeader
        className={cn(
          'border-b px-4 pb-4 text-left sm:text-left',
          mobileVariant === 'full-height' && 'items-start px-4 pt-4 pr-14 pb-4 text-left',
          className,
        )}
        {...props}
      />
    )
  }

  return <DialogHeader className={className} {...props} />
}

function ResponsiveDialogBody({ className, ...props }: React.ComponentProps<'div'>) {
  const { isMobile, mobileVariant } = useResponsiveDialogContext()

  return (
    <div
      className={cn(
        'min-h-0 min-w-0',
        isMobile &&
          (mobileVariant === 'full-height' ? 'flex-1 overflow-y-auto px-4 py-4' : 'flex-1 overflow-y-auto px-4 py-4'),
        className,
      )}
      {...props}
    />
  )
}

function ResponsiveDialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
  const { isMobile } = useResponsiveDialogContext()

  if (isMobile) {
    return (
      <DrawerFooter
        className={cn('border-t bg-background px-4 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))]', className)}
        {...props}
      />
    )
  }

  return <DialogFooter className={className} {...props} />
}

function ResponsiveDialogTitle(props: React.ComponentProps<typeof DialogTitle>) {
  const { isMobile } = useResponsiveDialogContext()

  return isMobile ? <DrawerTitle {...props} /> : <DialogTitle {...props} />
}

function ResponsiveDialogDescription(props: React.ComponentProps<typeof DialogDescription>) {
  const { isMobile } = useResponsiveDialogContext()

  return isMobile ? <DrawerDescription {...props} /> : <DialogDescription {...props} />
}

export {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogClose,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
}
