import { createFileRoute } from '@tanstack/react-router'
import { TermsOfServicePage } from '@valguide/core/features/legal/terms-of-service'

export const Route = createFileRoute('/terms-of-service')({
  component: TermsOfServicePage,
})
