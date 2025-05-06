import { PropsWithChildren, Suspense } from 'react'
import LoginLoading from './loading'
import { LoginProvider } from './login-provider'

export default function Layout({ children }: PropsWithChildren) {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginProvider>{children}</LoginProvider>
    </Suspense>
  )
}
