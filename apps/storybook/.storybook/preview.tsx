import '@valguide/ui/styles/globals.css'

import { withThemeByDataAttribute } from '@storybook/addon-themes'
import type { Preview } from '@storybook/nextjs-vite'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryHistory, createRootRoute, createRoute, createRouter, RouterProvider } from '@tanstack/react-router'
import { defaultThemes } from '@valguide/features/themes/defaults.ts'
import { themes } from '@valguide/features/themes/types.ts'
import type { SupportedLocale } from '@valguide/i18n/i18n.config'
import de from '@valguide/i18n/messages/de.json'
import en from '@valguide/i18n/messages/en.json'
import rm from '@valguide/i18n/messages/rm.json'
import { IntlProvider } from 'use-intl'

const childrenRef = { current: null as React.ReactNode }

function RootComponent() {
  return <>{childrenRef.current}</>
}

const rootRoute = createRootRoute({
  component: RootComponent,
})
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
})
rootRoute.addChildren([indexRoute])

const memoryHistory = createMemoryHistory({ initialEntries: ['/'] })
const mockRouter = createRouter({
  routeTree: rootRoute,
  history: memoryHistory,
})

function MockRouterProvider({ children }: { children: React.ReactNode }) {
  childrenRef.current = children
  return <RouterProvider router={mockRouter} />
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: Number.POSITIVE_INFINITY,
    },
  },
})

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
    theme: defaultThemes.light,
  },
  globalTypes: {
    locale: {
      description: 'Internationalization locale',
      toolbar: {
        title: 'Locale',
        icon: 'globe',
        items: Object.entries(locales).map(([value, title]) => ({ value, title })),
        dynamicTitle: true,
      },
    },
    theme: {
      description: 'Global theme for components',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: themes.map((theme) => ({ value: theme, title: theme.charAt(0).toUpperCase() + theme.slice(1) })),
        dynamicTitle: true,
      },
    },
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
      <QueryClientProvider client={queryClient}>
        <MockRouterProvider>
          <IntlProvider locale={locale} messages={messagesByLocale[locale as SupportedLocale]} timeZone="Europe/Zurich">
            <main className="font-geist">
              <Story />
            </main>
          </IntlProvider>
        </MockRouterProvider>
      </QueryClientProvider>
    ),
    withThemeByDataAttribute({
      themes: Object.fromEntries(themes.map((theme) => [theme, theme])),
      defaultTheme: defaultThemes.light,
      attributeName: 'data-theme',
    }),
  ],
}

export default preview
