'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import React, { Suspense, useEffect } from 'react'
import { PostHogProvider as PHProvider, usePostHog } from 'posthog-js/react'

import posthog from 'posthog-js'
import { createLogger } from '@valguide/logger'

const log = createLogger('PostHog')

const isPostHogEnabled = process.env.NEXT_PUBLIC_POSTHOG_ENABLED === 'true'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!isPostHogEnabled) {
      log.warn('PostHogProvider is disabled')
    }
  }, [isPostHogEnabled])
  return isPostHogEnabled ? <Provider>{children}</Provider> : children
}

function Provider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY as string, {
      // we rewrite the host using Vercel's rewrites in vercel.json
      // so we send events from the browser to our own domain
      api_host: `${window.location.origin}/ingest`, // process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com',
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
        url = url + '?' + searchParams.toString()
      }

      posthog.capture('$pageview', { $current_url: url })
    }
  }, [pathname, searchParams, posthog])

  return null
}

// Wrap PostHogPageView in Suspense to avoid the useSearchParams usage above
// from de-opting the whole app into client-side rendering
// See: https://nextjs.org/docs/messages/deopted-into-client-rendering
function SuspendedPostHogPageView() {
  return (
    <Suspense fallback={null}>
      <PostHogPageView />
    </Suspense>
  )
}
