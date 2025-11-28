import { type PropsWithChildren, Suspense } from 'react'
import { signInWithOtpAction, verifyOtpAction } from '../actions'
import { AuthProvider } from '../auth-provider'
import LoginLoading from './loading'

export default function Layout({ children }: PropsWithChildren) {
  return (
    <Suspense fallback={<LoginLoading />}>
      <AuthProvider signInWithOtpAction={signInWithOtpAction} verifyOtpAction={verifyOtpAction} isLogin={true}>
        {children}
      </AuthProvider>
    </Suspense>
  )
}
