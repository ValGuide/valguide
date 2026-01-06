import { createFileRoute } from '@tanstack/react-router'

import SignupContainer from '@valguide/features/auth/signup/signup-container'

export const Route = createFileRoute('/_auth/signup')({
  component: SignupContainer,
})
