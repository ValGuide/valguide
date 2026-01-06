import { createFileRoute } from '@tanstack/react-router'
import { AuthProvider } from '@valguide/features/auth/auth-provider'
import SignupLoading from '@valguide/features/auth/signup/loading'
import SignupContainer from '@valguide/features/auth/signup/signup-container'

export const Route = createFileRoute('/_auth/signup')({
  component: () => (
    <AuthProvider isLogin={false}>
      <SignupContainer />
    </AuthProvider>
  ),
  pendingComponent: SignupLoading,
})
