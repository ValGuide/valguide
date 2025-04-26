'use client'

import { useState } from 'react'
import { useRouter } from '@/i18n/routing'
import { OtpInput } from '@valguide/ui/inputs/opt-input'
import { createLogger } from '@valguide/logger'

const log = createLogger('email-otp-verification')

export type VerifyOtpParams = {
  email: string
  code: string
  redirectTo: string
}

export const verifyOtp = async ({ email, code, redirectTo }: VerifyOtpParams): Promise<boolean> => {
  const encodedEmail = encodeURIComponent(email.toLowerCase().trim())
  const encodedCode = encodeURIComponent(code)
  const encodedCallbackUrl = encodeURIComponent(redirectTo)
  const otpRequestURL = `/api/auth/callback/email-otp?email=${encodedEmail}&token=${encodedCode}&callbackUrl=${encodedCallbackUrl}`
  const response = await fetch(otpRequestURL)
  log.info('Auth response', { response, redirectTo })
  return response.url.includes(redirectTo)
}

export type EmailOtpVerificationProps = {
  email: string
  redirectTo: string
  i18n: {}
}

export const EmailOtpVerification = ({ email, redirectTo, i18n }: EmailOtpVerificationProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const onComplete = async (code: string) => {
    setIsSubmitting(true)
    const isValid = await verifyOtp({ email, code, redirectTo })
    if (isValid) {
      router.replace(redirectTo)
    } else {
      router.replace(`/auth/error`)
    }
    setIsSubmitting(false)
  }

  return (
    <div className="flex flex-col">
      <OtpInput disabled={isSubmitting} onComplete={onComplete} />
    </div>
  )
}
