import { createFileRoute } from '@tanstack/react-router'
import { PoliciesPage } from '@/features/legal/policies-page'

export const Route = createFileRoute('/policies')({
  component: PoliciesPage,
})
