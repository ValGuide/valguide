import { type PropsWithChildren, Suspense } from 'react'
import { AuthProvider } from '../auth-provider'
import LoginLoading from './loading'

export default function Layout({ children }: PropsWithChildren) {
  return (
    <Suspense fallback={<LoginLoading />}>
      <AuthProvider>{children}</AuthProvider>
    </Suspense>
  )
}
