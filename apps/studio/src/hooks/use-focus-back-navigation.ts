import { useRouter } from '@tanstack/react-router'
import { useCallback } from 'react'

type UseFocusBackNavigationOptions = {
  fallbackTo: '/tours' | '/stops' | '/assets' | '/brand/theme'
}

export function useFocusBackNavigation({ fallbackTo }: UseFocusBackNavigationOptions) {
  const router = useRouter()

  return useCallback(() => {
    const referrer = document.referrer

    if (referrer) {
      try {
        const referrerUrl = new URL(referrer)

        if (referrerUrl.origin === window.location.origin && referrerUrl.pathname !== window.location.pathname) {
          router.history.back()
          return
        }
      } catch {
        // Ignore malformed referrers and fall back to the Studio entry route.
      }
    }

    void router.navigate({ to: fallbackTo, viewTransition: false })
  }, [fallbackTo, router])
}
