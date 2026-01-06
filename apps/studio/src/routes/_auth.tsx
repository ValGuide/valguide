import { createFileRoute, Outlet } from '@tanstack/react-router'
import { AuthProvider } from '@valguide/features/auth/auth-provider'
import LoginLoading from '@valguide/features/auth/login/loading'
import { Suspense } from 'react'

export const Route = createFileRoute('/_auth')({
  component: AuthLayout,
})

function AuthLayout() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <AuthProvider isLogin={true}>
        <Outlet />
      </AuthProvider>
    </Suspense>
  )
}
