import { PropsWithChildren, Suspense } from 'react'
import LoginLoading from './loading'
import { LoginProvider } from './login-provider'
import { signInWithOtpAction, verifyOtpAction } from '../actions'

export default function Layout({ children }: PropsWithChildren) {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginProvider signInWithOtpAction={signInWithOtpAction} verifyOtpAction={verifyOtpAction}>
        {children}
      </LoginProvider>
    </Suspense>
  )
}
