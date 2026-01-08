import { createFileRoute } from '@tanstack/react-router'
import { PrivacyPolicyPage } from '@valguide/core/features/legal/privacy-policy'

export const Route = createFileRoute('/privacy-policy')({
  component: PrivacyPolicyPage,
})
