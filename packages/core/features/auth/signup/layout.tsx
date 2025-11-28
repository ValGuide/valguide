import { type PropsWithChildren, Suspense } from 'react'
import { signInWithOtpAction, verifyOtpAction } from '../actions'
import { AuthProvider } from '../auth-provider'
import SignupLoading from './loading'

export default function Layout({ children }: PropsWithChildren) {
  return (
    <Suspense fallback={<SignupLoading />}>
      <AuthProvider signInWithOtpAction={signInWithOtpAction} verifyOtpAction={verifyOtpAction} isLogin={false}>
        {children}
      </AuthProvider>
    </Suspense>
  )
}
