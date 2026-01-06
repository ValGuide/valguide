import { createFileRoute, Outlet } from '@tanstack/react-router'
import LoginLoading from '@valguide/features/auth/login/loading'
import { Suspense } from 'react'

export const Route = createFileRoute('/_auth')({
  component: AuthLayout,
})

function AuthLayout() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <Outlet />
    </Suspense>
  )
}
