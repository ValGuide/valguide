import { PropsWithChildren, Suspense } from 'react'
import LoginLoading from './loading'
import { LoginProvider } from './login-provider'
import { signInWithOAuthAction, signInWithOtpAction, verifyOtpAction } from '../actions'

export default function Layout({ children }: PropsWithChildren) {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginProvider
        signInWithOAuthAction={signInWithOAuthAction}
        signInWithOtpAction={signInWithOtpAction}
        verifyOtpAction={verifyOtpAction}
      >
        {children}
      </LoginProvider>
    </Suspense>
  )
}
