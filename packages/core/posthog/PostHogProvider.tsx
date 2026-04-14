import { ClientOnly, useLocation, useSearch } from '@tanstack/react-router'
import posthog from 'posthog-js'
import { PostHogProvider as PHProvider, usePostHog } from 'posthog-js/react'
import type React from 'react'
import { Suspense, useEffect } from 'react'
import { clientEnv } from '../env/client'
import { flushMissingMessageQueue } from '../i18n/use-missing-message-tracker'
import {
  buildStudioAnalyticsProperties,
  buildStudioOrganizationProperties,
  buildStudioPersonProperties,
  POSTHOG_ORGANIZATION_GROUP,
  STUDIO_POSTHOG_APP,
  type StudioAnalyticsOrganization,
  type StudioAnalyticsProperties,
  type StudioProductEventName,
} from './product-analytics'

const isPostHogEnabled = clientEnv.VITE_POSTHOG_ENABLED

type PostHogProviderProps = {
  app: string
  children: React.ReactNode
}

export function PostHogProvider({ app, children }: PostHogProviderProps) {
  return <ClientOnly>{isPostHogEnabled ? <Provider app={app}>{children}</Provider> : children}</ClientOnly>
}

export function identifyStudioUserAnalytics(input: {
  distinctId: string
  role?: string | null
  approvedStatus?: string | null
  organization?: StudioAnalyticsOrganization | null
}): void {
  if (!posthog.__loaded) return

  registerAppProperty(STUDIO_POSTHOG_APP)
  posthog.identify(input.distinctId, buildStudioPersonProperties(input))

  if (input.organization) {
    posthog.group(
      POSTHOG_ORGANIZATION_GROUP,
      input.organization.nanoId,
      buildStudioOrganizationProperties(input.organization),
    )
    posthog.register(buildStudioAnalyticsProperties({}, input.organization))
  } else {
    posthog.register({ app: STUDIO_POSTHOG_APP })
  }
}

export function resetStudioUserAnalytics(): void {
  if (!posthog.__loaded) return
  posthog.reset()
}

export function captureStudioClientEvent(event: StudioProductEventName, properties?: StudioAnalyticsProperties): void {
  if (!posthog.__loaded) return

  posthog.capture(event, buildStudioAnalyticsProperties(properties))
}

function registerAppProperty(app: string): void {
  posthog.register({ app })
}

function withAppProperty(properties: unknown, app: string): Record<string, unknown> {
  if (properties && typeof properties === 'object' && !Array.isArray(properties)) {
    return { ...(properties as Record<string, unknown>), app }
  }

  return { app }
}

function Provider({ app, children }: PostHogProviderProps) {
  useEffect(() => {
    if (posthog.__loaded) {
      registerAppProperty(app)
      flushMissingMessageQueue()
      return
    }
    const posthogKey = clientEnv.VITE_POSTHOG_KEY
    if (!posthogKey) return

    posthog.init(posthogKey, {
      // Proxy through our domain to avoid ad blockers (see workers/posthog-proxy)
      api_host: clientEnv.VITE_POSTHOG_HOST ?? `${window.location.origin}/ingest`,

      // 🔒 GDPR Compliance Settings
      cookieless_mode: 'always',
      persistence: 'memory', // No cookies or localStorage - data only in memory
      mask_all_text: true, // Mask all text content to prevent PII collection
      mask_all_element_attributes: true, // Mask element attributes that may contain PII
      disable_session_recording: true, // Prevent recording of user sessions
      person_profiles: 'identified_only', // Only create profiles for identified users
      capture_pageview: true,
      before_send: (event) => {
        if (!event) return event
        event.properties = withAppProperty(event.properties, app)
        return event
      },
      loaded: () => {
        registerAppProperty(app)
        flushMissingMessageQueue()
      },
    })
  }, [app])

  return (
    <PHProvider client={posthog}>
      <SuspendedPostHogPageView />
      {children}
    </PHProvider>
  )
}

function PostHogPageView() {
  const location = useLocation()
  const searchParams = useSearch({ strict: false })
  const posthog = usePostHog()

  const pathname = location.pathname

  // Track pageviews
  useEffect(() => {
    if (pathname && posthog) {
      let url = window.origin + pathname
      const searchString = new URLSearchParams(searchParams as Record<string, string>).toString()
      if (searchString) {
        url = `${url}?${searchString}`
      }

      posthog.capture('$pageview', { $current_url: url })
    }
  }, [pathname, searchParams, posthog])

  return null
}

// Wrap PostHogPageView in Suspense to avoid useSearchParams and usePathname
// from de-opting the whole app into client-side rendering during prerender
// See: https://nextjs.org/docs/messages/deopted-into-client-rendering
function SuspendedPostHogPageView() {
  return (
    <Suspense fallback={null}>
      <PostHogPageView />
    </Suspense>
  )
}
