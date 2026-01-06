import '@valguide/ui/styles/globals.css'

import { withThemeByDataAttribute } from '@storybook/addon-themes'
import type { Preview } from '@storybook/nextjs-vite'
import type { SupportedLocale } from '@valguide/i18n/i18n.config'

import { themes } from '@valguide/ui/theme/themes'
import { NextIntlClientProvider } from '@valguide/core/i18n/mock'
import nextIntl from './next-intl'

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
    nextIntl,
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
      <NextIntlClientProvider
        locale={locale}
        messages={nextIntl.messagesByLocale[locale as SupportedLocale]}
        timeZone="Europe/Zurich"
      >
        <main className="font-geist">
          <Story />
        </main>
      </NextIntlClientProvider>
    ),
    withThemeByDataAttribute({
      themes: Object.fromEntries(themes.map((theme) => [theme, theme])),
      defaultTheme: 'light',
      attributeName: 'data-theme',
    }),
  ],
}

export default preview
