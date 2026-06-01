import { createMiddleware } from '@tanstack/react-start'
import { defaultLocale } from '@valguide/core/i18n/i18n.config'
import { getAcceptLanguageLocale } from '@valguide/core/i18n/locale-resolution'
import { getMaintenancePageI18n } from './i18n'
import { renderMaintenanceDocument } from './maintenance-page.server'
import { getMaintenanceStatus } from './state.server'
import type { MaintenanceApp, MaintenanceStatus } from './types'

type MaintenanceRequestMiddlewareOptions = {
  app: MaintenanceApp
  bypassPathPrefixes?: string[]
}
const DEFAULT_RETRY_AFTER_SECONDS = '120'
const STATIC_PATH_PREFIXES = ['/assets/', '/fonts/', '/images/', '/favicon.ico', '/apple-touch-icon.png']
const STATIC_PATH_NAMES = ['/manifest.json', '/robots.txt', '/sitemap.xml']

function isDocumentRequest(request: Request): boolean {
  if (request.method !== 'GET') return false

  const mode = request.headers.get('sec-fetch-mode')
  const destination = request.headers.get('sec-fetch-dest')
  if (mode === 'navigate' || destination === 'document') return true

  const accept = request.headers.get('accept') ?? ''
  return accept.includes('text/html')
}

function isStaticAssetPath(pathname: string): boolean {
  if (STATIC_PATH_NAMES.includes(pathname)) return true
  if (STATIC_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return true
  return /\.[a-z0-9]+$/i.test(pathname)
}

function shouldBypassPath(pathname: string, bypassPathPrefixes: string[]): boolean {
  if (isStaticAssetPath(pathname)) return true
  return bypassPathPrefixes.some((prefix) => pathname.startsWith(prefix))
}

function getMaintenanceForceEnvKey(app: MaintenanceApp): string {
  return app === 'studio' ? 'MAINTENANCE_FORCE_STUDIO' : 'MAINTENANCE_FORCE_APP'
}

type MaintenanceForcedByEnvState = {
  envKey: string
  value: string | undefined
  enabled: boolean
}

function getMaintenanceForcedByEnvState(app: MaintenanceApp): MaintenanceForcedByEnvState {
  const envKey = getMaintenanceForceEnvKey(app)
  const value = process.env[envKey]
  if (!value) {
    return {
      envKey,
      value: undefined,
      enabled: false,
    }
  }
  const normalized = value.trim().toLowerCase()
  return {
    envKey,
    value,
    enabled: normalized === '1' || normalized === 'true' || normalized === 'yes' || normalized === 'on',
  }
}

function getForcedMaintenanceStatus({
  app,
  request,
  forcedByEnv,
}: {
  app: MaintenanceApp
  request: Request
  forcedByEnv: MaintenanceForcedByEnvState
}): MaintenanceStatus {
  const locale = getAcceptLanguageLocale(request.headers.get('accept-language')) ?? defaultLocale
  const i18n = getMaintenancePageI18n(locale, app)
  console.info(
    `[maintenance] Forced maintenance enabled via env var ${forcedByEnv.envKey}=${forcedByEnv.value} for app=${app}`,
  )

  return {
    app,
    enabled: true,
    message: i18n.description,
    eta: null,
    enabledAt: null,
    enabledBy: null,
  }
}

export function createMaintenanceRequestMiddleware({
  app,
  bypassPathPrefixes = ['/health', '/_health'],
}: MaintenanceRequestMiddlewareOptions) {
  return createMiddleware({ type: 'request' }).server(async ({ next, request }) => {
    const url = new URL(request.url)
    if (shouldBypassPath(url.pathname, bypassPathPrefixes)) {
      return next()
    }

    const forcedByEnv = getMaintenanceForcedByEnvState(app)
    const status = forcedByEnv.enabled
      ? getForcedMaintenanceStatus({ app, request, forcedByEnv })
      : await getMaintenanceStatus(app)

    if (!status.enabled) {
      return next()
    }

    return handleMaintenanceResponse({
      app,
      request,
      status,
    })
  })
}

function handleMaintenanceResponse({
  app,
  request,
  status,
}: {
  app: MaintenanceApp
  request: Request
  status: Awaited<ReturnType<typeof getMaintenanceStatus>>
}) {
  const headers = new Headers({
    'cache-control': 'no-store',
    'retry-after': DEFAULT_RETRY_AFTER_SECONDS,
    'x-maintenance-app': app,
  })

  if (isDocumentRequest(request)) {
    headers.set('content-type', 'text/html; charset=utf-8')
    return new Response(
      renderMaintenanceDocument({
        app,
        status,
        acceptLanguageHeader: request.headers.get('accept-language'),
        cookieHeader: request.headers.get('cookie'),
      }),
      {
        status: 503,
        headers,
      },
    )
  }

  return Response.json(
    {
      error: 'maintenance_mode',
      app,
      message: status.message,
      eta: status.eta,
    },
    {
      status: 503,
      headers,
    },
  )
}
