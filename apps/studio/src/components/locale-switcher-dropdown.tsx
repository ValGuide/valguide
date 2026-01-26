'use client'

import { useLocale, useTranslations } from '@valguide/core/i18n/client'
import { type SupportedLocale, supportedLocales } from '@valguide/core/i18n/i18n.config'
import { setLocaleFn } from '@valguide/core/i18n/set-locale.fn'
import {
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@valguide/ui/components/dropdown-menu'
import { Check, Languages } from 'lucide-react'

const localeNames: Record<SupportedLocale, string> = {
  en: 'English',
  de: 'Deutsch',
  rm: 'Rumantsch',
}

export function LocaleSwitcherDropdown() {
  const currentLocale = useLocale()
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
      <DropdownMenuSubContent>
        {supportedLocales.map((locale) => (
          <DropdownMenuItem key={locale} onClick={() => handleLocaleChange(locale)} className="cursor-pointer">
            <span className="flex-1">{localeNames[locale]}</span>
            {currentLocale === locale && <Check className="size-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  )
}
