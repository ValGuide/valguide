import { useLocale, useTranslations } from '@valguide/core/i18n/client'
import { LocalePickerList } from '@valguide/core/i18n/components/locale-picker-list'
import { defaultLocale, type SupportedLocale, supportedLocales } from '@valguide/core/i18n/i18n.config'
import { setLocaleFn } from '@valguide/core/i18n/set-locale.fn'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@valguide/ui/components/dialog'
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@valguide/ui/components/drawer'
import { useEffect, useState } from 'react'

interface LocaleSwitcherDropdownProps {
  isMobile: boolean
  onOpenChange: (open: boolean) => void
  open: boolean
}

export function LocaleSwitcherDropdown({ isMobile, onOpenChange, open }: LocaleSwitcherDropdownProps) {
  const locale = useLocale()
  const currentLocale = supportedLocales.includes(locale as SupportedLocale)
    ? (locale as SupportedLocale)
    : defaultLocale
  const t = useTranslations('sidebar.user')
  const [isSwitching, setIsSwitching] = useState(false)
  const [selectedLocale, setSelectedLocale] = useState(currentLocale)

  useEffect(() => {
    if (!isSwitching) {
      setSelectedLocale(currentLocale)
    }
  }, [currentLocale, isSwitching])

  const handleLocaleChange = async (newLocale: SupportedLocale) => {
    if (newLocale === currentLocale || isSwitching) return
    setIsSwitching(true)
    setSelectedLocale(newLocale)
    try {
      await setLocaleFn({ data: { locale: newLocale } })
      window.location.replace(window.location.href)
    } catch {
      setSelectedLocale(currentLocale)
      setIsSwitching(false)
    }
  }

  const title = t('language')

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription className="sr-only">{title}</DrawerDescription>
          </DrawerHeader>
          <LocalePickerList
            currentLocale={selectedLocale}
            disabled={isSwitching}
            onSelectLocale={(locale) => void handleLocaleChange(locale)}
          />
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[380px] gap-0 p-0 overflow-hidden">
        <DialogHeader className="px-4 pt-4 pb-3">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="sr-only">{title}</DialogDescription>
        </DialogHeader>
        <LocalePickerList
          currentLocale={selectedLocale}
          disabled={isSwitching}
          onSelectLocale={(locale) => void handleLocaleChange(locale)}
        />
      </DialogContent>
    </Dialog>
  )
}
