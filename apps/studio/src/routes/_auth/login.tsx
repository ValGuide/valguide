import { createFileRoute } from '@tanstack/react-router'
import LoginLoading from '@valguide/features/auth/login/loading'

import LoginContainer from '@valguide/features/auth/login/login-container'

export const Route = createFileRoute('/_auth/login')({
  component: LoginContainer,
  pendingComponent: LoginLoading,
})
