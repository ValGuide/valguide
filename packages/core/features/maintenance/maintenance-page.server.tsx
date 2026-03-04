import { generateThemeScript, resolveTheme } from '@valguide/core/features/themes/defaults'
import { defaultLocale, type SupportedLocale, supportedLocales } from '@valguide/core/i18n/i18n.config'
import appCss from '@valguide/ui/styles/globals.css?url'
import { renderToStaticMarkup } from 'react-dom/server'
import { getMaintenancePageI18n } from './i18n'
import { MaintenancePage } from './maintenance-page'
import type { MaintenanceApp, MaintenanceStatus } from './types'

type RenderMaintenanceDocumentInput = {
  app: MaintenanceApp
  status: MaintenanceStatus
  acceptLanguageHeader: string | null
  cookieHeader: string | null
}

function appName(app: MaintenanceApp): string {
  return app === 'studio' ? 'ValGuide Studio' : 'ValGuide App'
}

function themeCookieName(app: MaintenanceApp): string {
  return app === 'studio' ? 'valguide-studio-theme' : 'valguide-app-theme'
}

function getCookieValue(cookieHeader: string | null, key: string): string | null {
  if (!cookieHeader) return null
  const pairs = cookieHeader.split(';')
  for (const pair of pairs) {
    const [rawName, ...rawValue] = pair.trim().split('=')
    if (rawName !== key) continue
    const value = rawValue.join('=').trim()
    if (!value) return null
    try {
      return decodeURIComponent(value)
    } catch {
      return value
    }
  }
  return null
}

function resolveMaintenanceLocale(acceptLanguageHeader: string | null): SupportedLocale {
  if (!acceptLanguageHeader) return defaultLocale

  const tokens = acceptLanguageHeader
    .split(',')
    .map((token) => token.trim().toLowerCase())
    .filter((token) => token.length > 0)

  for (const token of tokens) {
    const languageTag = token.split(';')[0]
    const baseLanguage = languageTag.split('-')[0]
    const matched = supportedLocales.find((locale) => locale === languageTag || locale === baseLanguage)
    if (matched) return matched
  }

  return defaultLocale
}

export function renderMaintenanceDocument({
  app,
  status,
  acceptLanguageHeader,
  cookieHeader,
}: RenderMaintenanceDocumentInput): string {
  const locale = resolveMaintenanceLocale(acceptLanguageHeader)
  const i18n = getMaintenancePageI18n(locale, app)
  const title = `${i18n.title} - ${appName(app)}`
  const cookieName = themeCookieName(app)
  const rawTheme = getCookieValue(cookieHeader, cookieName) ?? 'system'
  const resolvedTheme = resolveTheme(rawTheme)

  const body = renderToStaticMarkup(
    <MaintenancePage appName={appName(app)} locale={locale} i18n={i18n} message={status.message} eta={status.eta} />,
  )

  return `<!doctype html>
<html lang="${locale}" data-theme="${resolvedTheme}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <link rel="stylesheet" href="${appCss}" />
    <script>${generateThemeScript(cookieName)}</script>
  </head>
  <body class="m-0">
    ${body}
    <script>
      const retryButton = document.querySelector('[data-retry-button]');
      if (retryButton) {
        retryButton.addEventListener('click', () => window.location.reload());
      }
    </script>
  </body>
</html>`
}
