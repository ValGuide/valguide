import { useLocale, useTranslations } from '@valguide/core/i18n/client'
import { LocalePickerList } from '@valguide/core/i18n/components/locale-picker-list'
import { defaultLocale, type SupportedLocale, supportedLocales } from '@valguide/core/i18n/i18n.config'
import { setLocaleFn } from '@valguide/core/i18n/set-locale.fn'
import { DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger } from '@valguide/ui/components/dropdown-menu'
import { Languages } from 'lucide-react'

export function LocaleSwitcherDropdown() {
  const locale = useLocale()
  const currentLocale = supportedLocales.includes(locale as SupportedLocale)
    ? (locale as SupportedLocale)
    : defaultLocale
  const t = useTranslations('sidebar.user')

  const handleLocaleChange = async (newLocale: SupportedLocale) => {
    if (newLocale === currentLocale) return
    await setLocaleFn({ data: { locale: newLocale } })
    window.location.replace(window.location.href)
  }

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger className="cursor-pointer">
        <Languages />
        {t('language')}
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent className="w-[300px] p-0">
        <LocalePickerList currentLocale={currentLocale} onSelectLocale={(locale) => void handleLocaleChange(locale)} />
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  )
}
