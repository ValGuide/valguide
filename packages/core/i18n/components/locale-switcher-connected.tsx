import { useRouter } from '@tanstack/react-router'
import { useLocale } from 'use-intl'
import { type SupportedLocale, supportedLocales } from '../i18n.config'
import { setLocaleFn } from '../set-locale.fn'
import { LocaleSwitcher } from './locale-switcher'

export function LocaleSwitcherConnected() {
  const router = useRouter()
  const locale = useLocale()
  const currentLocale = supportedLocales.includes(locale as SupportedLocale)
    ? (locale as SupportedLocale)
    : supportedLocales[0]

  return (
    <LocaleSwitcher
      currentLocale={currentLocale}
      onLocaleChange={async (nextLocale) => {
        await setLocaleFn({ data: { locale: nextLocale } })
        router.invalidate()
      }}
    />
  )
}
