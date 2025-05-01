import '@valguide/ui/styles/globals.css'

import { Preview } from '@storybook/react'
import { withThemeByDataAttribute } from '@storybook/addon-themes'
import { NextIntlClientProvider } from 'next-intl'

import en from '@valguide/i18n/messages/en.json' with { type: 'json' }
import de from '@valguide/i18n/messages/de.json' with { type: 'json' }
import rm from '@valguide/i18n/messages/rm.json' with { type: 'json' }

import type { SupportedLocale } from '@valguide/visit/i18n/i18n.config'
import { themes } from '@valguide/ui/theme/themes'

const messages: Record<SupportedLocale, any> = { en, de, rm }
const locales: Record<SupportedLocale, String> = {
  en: 'English 🇺🇸',
  de: 'Deutsch 🇩🇪',
  rm: 'Romansh ',
}

const preview: Preview = {
  initialGlobals: {
    locale: 'en',
    locales,
  },
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    previewTabs: {
      'storybook/docs/panel': { index: -1 },
    },
  },
  decorators: [
    (Story, { globals: { locale } }) => (
      <NextIntlClientProvider locale={locale} messages={messages[locale as SupportedLocale]}>
        <main className="font-noto">
          <Story />
        </main>
      </NextIntlClientProvider>
    ),
    withThemeByDataAttribute({
      themes: themes.reduce(
        (acc, theme) => ({
          ...acc,
          [theme]: theme,
        }),
        {},
      ),
      defaultTheme: 'light',
      attributeName: 'data-theme',
    }),
  ],
}

export default preview
