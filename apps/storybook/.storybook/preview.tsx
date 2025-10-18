import '@valguide/ui/styles/globals.css'

import { Preview } from '@storybook/nextjs-vite'
import { withThemeByDataAttribute } from '@storybook/addon-themes'
import { NextIntlClientProvider } from 'next-intl'

import { themes } from '@valguide/ui/theme/themes'
import { SupportedLocale } from '@valguide/i18n/i18n.config'
import nextIntl from './next-intl';

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
    nextIntl,
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
      <NextIntlClientProvider locale={locale} messages={nextIntl.messagesByLocale[locale as SupportedLocale]}>
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
