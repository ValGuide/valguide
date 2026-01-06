import { type PropsWithChildren, Suspense } from 'react'
import { AuthProvider } from '../auth-provider'
import SignupLoading from './loading'

export default function Layout({ children }: PropsWithChildren) {
  return (
    <Suspense fallback={<SignupLoading />}>
      <AuthProvider isLogin={false}>{children}</AuthProvider>
    </Suspense>
  )
}
