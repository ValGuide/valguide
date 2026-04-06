import { createFileRoute } from '@tanstack/react-router'
import { TermsOfServicePage } from '@/features/legal/terms-of-service-page'

export const Route = createFileRoute('/terms-of-service')({
  component: TermsOfServicePage,
})
