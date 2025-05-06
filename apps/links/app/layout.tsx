import { ReactNode } from 'react'
import { PostHogProvider } from '@valguide/core/posthog/PostHogProvider'
import { setRequestLocale } from 'next-intl/server'
import { defaultLocale } from '@valguide/i18n/i18n.config'

type Props = {
  children: ReactNode
}

// Since we have a `not-found-page.tsx` page on the root, a layout file
// is required, even if it's just passing children through.
export default function RootLayout({ children }: Props) {
  setRequestLocale(defaultLocale)
  return <PostHogProvider>{children}</PostHogProvider>
}
