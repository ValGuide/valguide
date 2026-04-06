import { type SupportedLocale, supportedLocales } from '../i18n.config'
import { getLocaleNativeName } from '../locale-display-names'

interface LocaleSwitcherProps {
  currentLocale: SupportedLocale
  disabled?: boolean
  onLocaleChange: (locale: SupportedLocale) => Promise<void> | void
}

export function LocaleSwitcher({ currentLocale, disabled = false, onLocaleChange }: LocaleSwitcherProps) {
  const handleChange = async (newLocale: string) => {
    if (newLocale === currentLocale || disabled) return
    await onLocaleChange(newLocale as SupportedLocale)
  }

  return (
    <select
      value={currentLocale}
      disabled={disabled}
      onChange={(e) => handleChange(e.target.value)}
      className="rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
    >
      {supportedLocales.map((locale) => (
        <option key={locale} value={locale}>
          {getLocaleNativeName(locale)}
        </option>
      ))}
    </select>
  )
}
