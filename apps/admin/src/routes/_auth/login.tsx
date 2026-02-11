import { createFileRoute } from '@tanstack/react-router'
import { adminSignInWithOtpFn } from '@valguide/core/features/admin/admin-sign-in-with-otp.fn'
import { AuthProvider } from '@valguide/features/auth/auth-provider'
import LoginLoading from '@valguide/features/auth/login/loading'
import LoginContainer from '@valguide/features/auth/login/login-container'

export const Route = createFileRoute('/_auth/login')({
  component: () => (
    <AuthProvider signInFn={adminSignInWithOtpFn}>
      <LoginContainer />
    </AuthProvider>
  ),
  pendingComponent: LoginLoading,
})
