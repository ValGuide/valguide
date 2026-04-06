import { createFileRoute } from '@tanstack/react-router'
import { CookiePolicyPage } from '@/features/legal/cookie-policy-page'

export const Route = createFileRoute('/cookie-policy')({
  component: CookiePolicyPage,
})
