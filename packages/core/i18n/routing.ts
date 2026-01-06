import { defaultLocale, supportedLocales } from '@valguide/i18n/i18n.config'
import { createNavigation, defineRouting } from '@valguide/core/i18n/mock-navigation'

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: supportedLocales,

  // Used when no locale matches
  defaultLocale,
})

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing)
