'use client'

import { useRouter } from '@tanstack/react-router'
import { useLocale } from 'use-intl'
import { type SupportedLocale, supportedLocales } from '../i18n.config'
import { setLocaleFn } from '../set-locale'

const localeNames: Record<SupportedLocale, string> = {
  en: 'English',
  de: 'Deutsch',
  rm: 'Rumantsch',
}

export function LocaleSwitcher() {
  const currentLocale = useLocale()
  const router = useRouter()

  const handleChange = async (newLocale: string) => {
    if (newLocale === currentLocale) return
    await setLocaleFn({ data: { locale: newLocale as SupportedLocale } })
    router.invalidate()
  }

  return (
    <select
      value={currentLocale}
      onChange={(e) => handleChange(e.target.value)}
      className="rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
    >
      {supportedLocales.map((locale) => (
        <option key={locale} value={locale}>
          {localeNames[locale]}
        </option>
      ))}
    </select>
  )
}
