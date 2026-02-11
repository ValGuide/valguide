import { ClientOnly, useLocation, useSearch } from '@tanstack/react-router'
import posthog from 'posthog-js'
import { PostHogProvider as PHProvider, usePostHog } from 'posthog-js/react'
import type React from 'react'
import { Suspense, useEffect } from 'react'
import { clientEnv } from '../env/client'

const isPostHogEnabled = clientEnv.VITE_POSTHOG_ENABLED

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return (
    <ClientOnly>
      {isPostHogEnabled ? (
        <Provider>{children}</Provider>
      ) : (
        children
      )}
    </ClientOnly>
  )
}

function Provider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (posthog.__loaded) return
    posthog.init(clientEnv.VITE_POSTHOG_KEY!, {
      // Proxy through our domain to avoid ad blockers (see vercel.ts rewrites)
      api_host: clientEnv.VITE_POSTHOG_HOST ?? `${window.location.origin}/ingest`,

      // 🔒 GDPR Compliance Settings
      cookieless_mode: 'always',
      persistence: 'memory', // No cookies or localStorage - data only in memory
      mask_all_text: true, // Mask all text content to prevent PII collection
      mask_all_element_attributes: true, // Mask element attributes that may contain PII
      disable_session_recording: true, // Prevent recording of user sessions
      person_profiles: 'identified_only', // Only create profiles for identified users
      capture_pageview: true,
    })
  }, [])

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
