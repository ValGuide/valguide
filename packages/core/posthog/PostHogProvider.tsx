
import { createLogger } from '@valguide/logger'
// biome-ignore lint/style/noRestrictedImports: useSearchParams and usePathname are only available from next/navigation
import { usePathname, useSearchParams } from 'next/navigation'
import posthog from 'posthog-js'
import { PostHogProvider as PHProvider, usePostHog } from 'posthog-js/react'
import type React from 'react'
import { Suspense, useEffect } from 'react'

const log = createLogger('PostHog')

const isPostHogEnabled = process.env.NEXT_PUBLIC_VG_POSTHOG_ENABLED === 'true'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!isPostHogEnabled) {
      log.warn('PostHogProvider is disabled')
    }
  }, [])
  return isPostHogEnabled ? <Provider>{children}</Provider> : children
}

function Provider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_VG_POSTHOG_KEY as string, {
      // we rewrite the host using Vercel's rewrites in next.config.mjs
      // so we send events from the browser to our own domain
      api_host: `${window.location.origin}/ingest`, // process.env.NEXT_PUBLIC_VG_POSTHOG_HOST || 'https://eu.i.posthog.com',
      person_profiles: 'always', // or 'always' to create profiles for anonymous users as well
      capture_pageview: false, // Disable automatic pageview capture, as we capture manually
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
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const posthog = usePostHog()

  // Track pageviews
  useEffect(() => {
    if (pathname && posthog) {
      let url = window.origin + pathname
      if (searchParams.toString()) {
        url = `${url}?${searchParams.toString()}`
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
