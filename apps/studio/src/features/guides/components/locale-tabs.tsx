import { Tabs, TabsList, TabsTrigger } from '@valguide/ui/components/tabs'
import { useId } from 'react'

export type LocaleTabsProps = {
  value: string
  onValueChange: (locale: string) => void
  locales?: string[]
}

export function LocaleTabs({ value, onValueChange, locales = ['en'] }: LocaleTabsProps) {
  const id = useId()

  return (
    <Tabs id={id} value={value} onValueChange={onValueChange}>
      <TabsList>
        {locales.map((locale) => (
          <TabsTrigger key={locale} value={locale} className="uppercase">
            {locale}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
