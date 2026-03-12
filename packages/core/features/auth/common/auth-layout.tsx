import { useLocale, useTranslations } from '@valguide/core/i18n/client'
import { LocalePickerList } from '@valguide/core/i18n/components/locale-picker-list'
import { defaultLocale, type SupportedLocale, supportedLocales } from '@valguide/core/i18n/i18n.config'
import { getLocaleNativeName } from '@valguide/core/i18n/locale-display-names'
import { setLocaleFn } from '@valguide/core/i18n/set-locale.fn'
import { Card, CardContent } from '@valguide/core/ui/components/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@valguide/core/ui/components/dialog'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@valguide/core/ui/components/drawer'
import { useIsMobile } from '@valguide/core/ui/hooks/use-mobile'
import { cn } from '@valguide/ui/lib/utils'
import { Languages } from 'lucide-react'
import { type ReactNode, useState } from 'react'

export interface AuthLayoutProps {
  children: ReactNode
  footer?: ReactNode
}

export function AuthLayout({ children, footer }: AuthLayoutProps) {
  return (
    <main className="min-h-svh flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div
        className={cn(
          'absolute inset-0',
          'bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))]',
          'from-background via-muted to-muted',
          'dark:from-muted/50 dark:via-background dark:to-background',
        )}
      />

      <div
        className="absolute inset-0 opacity-[0.025] dark:opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Cpath fill='none' stroke='%23000' stroke-width='0.5' d='M0 50 Q50 20 100 50 T200 50 M0 100 Q50 70 100 100 T200 100 M0 150 Q50 120 100 150 T200 150'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }}
      />

      <div className="absolute top-4 right-4 z-10">
        <AuthLocaleSwitcher />
      </div>

      <Card
        className={cn(
          'relative w-full max-w-md',
          'shadow-xl shadow-black/5 dark:shadow-black/20',
          'border border-border/50',
          'rounded-2xl',
        )}
      >
        <CardContent className="p-8">{children}</CardContent>
      </Card>

      {footer && <div className="relative mt-6 w-full max-w-md text-center">{footer}</div>}
    </main>
  )
}

function AuthLocaleSwitcher() {
  const t = useTranslations('auth')
  const locale = useLocale()
  const currentLocale = supportedLocales.includes(locale as SupportedLocale)
    ? (locale as SupportedLocale)
    : defaultLocale
  const isMobile = useIsMobile()
  const [open, setOpen] = useState(false)
  const [isSwitching, setIsSwitching] = useState(false)
  const currentDisplayName = getLocaleNativeName(currentLocale)

  const handleLocaleChange = async (newLocale: SupportedLocale) => {
    if (newLocale === currentLocale || isSwitching) {
      return
    }

    setIsSwitching(true)
    try {
      await setLocaleFn({ data: { locale: newLocale } })
      window.location.reload()
    } finally {
      setIsSwitching(false)
    }
  }

  const title = t('languageLabel')
  const pickerList = (
    <LocalePickerList
      currentLocale={currentLocale}
      disabled={isSwitching}
      onSelectLocale={(locale) => void handleLocaleChange(locale)}
    />
  )

  return (
    <>
      <button
        type="button"
        aria-label={title}
        disabled={isSwitching}
        onClick={() => setOpen(true)}
        className="flex h-9 items-center gap-2 rounded-md border border-border/60 bg-background/90 px-2.5 text-sm text-foreground backdrop-blur transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Languages className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <span className="max-w-28 truncate">{currentDisplayName}</span>
      </button>
      {isMobile ? (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>{title}</DrawerTitle>
              <DrawerDescription className="sr-only">{title}</DrawerDescription>
            </DrawerHeader>
            {pickerList}
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-[380px] gap-0 p-0 overflow-hidden">
            <DialogHeader className="px-4 pt-4 pb-3">
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription className="sr-only">{title}</DialogDescription>
            </DialogHeader>
            {pickerList}
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
