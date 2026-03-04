import { defaultLocale, type SupportedLocale, supportedLocales } from '@valguide/core/i18n/i18n.config'
import { renderToStaticMarkup } from 'react-dom/server'
import { getMaintenancePageI18n } from './i18n'
import { MaintenancePage } from './maintenance-page'
import type { MaintenanceApp, MaintenanceStatus } from './types'

type RenderMaintenanceDocumentInput = {
  app: MaintenanceApp
  status: MaintenanceStatus
  acceptLanguageHeader: string | null
}

function appName(app: MaintenanceApp): string {
  return app === 'studio' ? 'ValGuide Studio' : 'ValGuide App'
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
}: RenderMaintenanceDocumentInput): string {
  const locale = resolveMaintenanceLocale(acceptLanguageHeader)
  const i18n = getMaintenancePageI18n(locale)
  const title = `${i18n.title} - ${appName(app)}`

  const body = renderToStaticMarkup(
    <MaintenancePage appName={appName(app)} i18n={i18n} message={status.message} eta={status.eta} />,
  )

  return `<!doctype html>
<html lang="${locale}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <style>
      :root {
        color-scheme: light dark;
      }
      body {
        margin: 0;
        font-family: "Noto Sans", sans-serif;
        background: linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
        color: #0f172a;
      }
      main {
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 24px;
      }
      article {
        width: min(640px, 100%);
        border: 1px solid #cbd5e1;
        border-radius: 14px;
        background: #ffffff;
        padding: 28px;
        box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
      }
      .eyebrow {
        margin: 0 0 8px;
        font-size: 0.75rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: #475569;
      }
      h1 {
        margin: 0 0 12px;
        font-size: 1.5rem;
        line-height: 1.3;
      }
      .message {
        margin: 0;
        font-size: 1rem;
        line-height: 1.5;
      }
      .eta {
        margin: 14px 0 0;
        font-size: 0.95rem;
        opacity: 0.86;
      }
      .hint {
        margin-top: 20px;
        font-size: 0.9rem;
        opacity: 0.75;
      }
      @media (max-width: 640px) {
        article {
          padding: 20px;
        }
        h1 {
          font-size: 1.25rem;
        }
      }
    </style>
  </head>
  <body>${body}</body>
</html>`
}
