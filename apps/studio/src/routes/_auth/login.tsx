import { createFileRoute } from '@tanstack/react-router'
import { AuthProvider } from '@valguide/features/auth/auth-provider'
import LoginLoading from '@valguide/features/auth/login/loading'
import LoginContainer from '@valguide/features/auth/login/login-container'

export const Route = createFileRoute('/_auth/login')({
  component: () => (
    <AuthProvider>
      <LoginContainer />
    </AuthProvider>
  ),
  pendingMinMs: 1000,
  pendingMs: 0,
  pendingComponent: LoginLoading,
})
