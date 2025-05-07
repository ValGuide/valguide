import { PropsWithChildren, Suspense } from 'react'
import LoginLoading from './loading'
import { AuthProvider } from '../auth-provider'
import { signInWithOtpAction, verifyOtpAction } from '../actions'

export default function Layout({ children }: PropsWithChildren) {
  return (
    <Suspense fallback={<LoginLoading />}>
      <AuthProvider signInWithOtpAction={signInWithOtpAction} verifyOtpAction={verifyOtpAction} isLogin={true}>
        {children}
      </AuthProvider>
    </Suspense>
  )
}
