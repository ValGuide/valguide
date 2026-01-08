import { createFileRoute } from '@tanstack/react-router'
import LoginLayout from '@valguide/features/auth/login/layout'
import LoginLoading from '@valguide/features/auth/login/loading'
import LoginContainer from '@valguide/features/auth/login/login-container'
import { Suspense } from 'react'

export const Route = createFileRoute('/_auth/login')({
  component: LoginPage,
})

function LoginPage() {
  return (
    <LoginLayout>
      <Suspense fallback={<LoginLoading />}>
        <LoginContainer />
      </Suspense>
    </LoginLayout>
  )
}
