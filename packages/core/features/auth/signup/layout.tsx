import { PropsWithChildren, Suspense } from 'react'
import SignupLoading from './loading'
import { SignupProvider } from './signup-provider'
import { signInWithOtpAction, verifyOtpAction } from '../actions'

export default function Layout({ children }: PropsWithChildren) {
  return (
    <Suspense fallback={<SignupLoading />}>
      <SignupProvider signInWithOtpAction={signInWithOtpAction} verifyOtpAction={verifyOtpAction}>
        {children}
      </SignupProvider>
    </Suspense>
  )
}
