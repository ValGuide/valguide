'use client'

import { type SupportedLocale, supportedLocales } from '@valguide/i18n/i18n.config'
import { Tabs, TabsList, TabsTrigger } from '@valguide/ui/components/tabs'

export type LocaleTabsProps = {
  value: SupportedLocale
  onValueChange: (locale: SupportedLocale) => void
}

export function LocaleTabs({ value, onValueChange }: LocaleTabsProps) {
  return (
    <Tabs value={value} onValueChange={(val) => onValueChange(val as SupportedLocale)}>
      <TabsList>
        {supportedLocales.map((locale) => (
          <TabsTrigger key={locale} value={locale} className="uppercase">
            {locale}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
