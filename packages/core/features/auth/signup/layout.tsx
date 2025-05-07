import { PropsWithChildren, Suspense } from 'react'
import SignupLoading from './loading'
import { AuthProvider } from '../auth-provider'
import { signInWithOtpAction, verifyOtpAction } from '../actions'

export default function Layout({ children }: PropsWithChildren) {
  return (
    <Suspense fallback={<SignupLoading />}>
      <AuthProvider signInWithOtpAction={signInWithOtpAction} verifyOtpAction={verifyOtpAction} isLogin={false}>
        {children}
      </AuthProvider>
    </Suspense>
  )
}
