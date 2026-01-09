import '@valguide/ui/styles/globals.css'

import { withThemeByDataAttribute } from '@storybook/addon-themes'
import type { Preview } from '@storybook/nextjs-vite'
import type { SupportedLocale } from '@valguide/i18n/i18n.config'
import de from '@valguide/i18n/messages/de.json'
import en from '@valguide/i18n/messages/en.json'
import rm from '@valguide/i18n/messages/rm.json'
import { themes } from '@valguide/ui/theme/themes'
import { IntlProvider } from 'use-intl'

const messagesByLocale: Record<SupportedLocale, typeof en> = { en, de, rm }

const locales: Record<SupportedLocale, string> = {
  en: 'English 🇺🇸',
  de: 'Deutsch 🇩🇪',
  rm: 'Romontsch 🇨🇭',
}

const preview: Preview = {
  initialGlobals: {
    locale: 'en',
    locales,
  },
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
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
      <IntlProvider locale={locale} messages={messagesByLocale[locale as SupportedLocale]} timeZone="Europe/Zurich">
        <main className="font-geist">
          <Story />
        </main>
      </IntlProvider>
    ),
    withThemeByDataAttribute({
      themes: Object.fromEntries(themes.map((theme) => [theme, theme])),
      defaultTheme: 'light',
      attributeName: 'data-theme',
    }),
  ],
}

export default preview
