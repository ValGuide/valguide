'use client'

import { ReactNode } from 'react'
import { MessageAlert } from './message-alert'
import { AuthLayout } from './auth-layout'
import { OtpVerificationForm } from '../login/otp-verification-form'
import { AuthForm } from '../auth-form'
import { Consent } from '../consent'

export interface AuthContainerProps {
  // Translation strings
  welcomeText: string
  promptText: string
  verifyEmailText: string
  checkEmailText: string
  sendCodeText: string
  sendingText: string
  verifyCodeText: string
  verifyingText: string
  otpLabelText: string
  otpPlaceholderText: string
  resendCodeText: string
  emailLabelText: string
  emailPlaceholderText: string

  // Auth state and handlers
  email: string
  setEmail: (email: string) => void
  otp: string
  setOtp: (otp: string) => void
  handleEmailAuth: (email: string) => void
  handleVerifyOtp: (e: React.FormEvent) => void
  handleResendOtp: () => void
  loading: boolean
  message: { type: 'success' | 'error'; text: string } | null
  verifyingOtp: boolean
  isLogin: boolean
}

export function AuthContainer({
  // Translation strings
  welcomeText,
  promptText,
  verifyEmailText,
  checkEmailText,
  sendCodeText,
  sendingText,
  verifyCodeText,
  verifyingText,
  otpLabelText,
  otpPlaceholderText,
  resendCodeText,
  emailLabelText,
  emailPlaceholderText,

  // Auth state and handlers
  email,
  setEmail,
  otp,
  setOtp,
  handleEmailAuth,
  handleVerifyOtp,
  handleResendOtp,
  loading,
  message,
  verifyingOtp,
  isLogin,
}: AuthContainerProps) {
  return (
    <AuthLayout>
      <div className="flex flex-1 flex-col justify-center">
        {verifyingOtp ? (
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold tracking-tight">{welcomeText}</h2>
            <p className="mt-2 text-sm text-gray-600">{email ? `${verifyEmailText} ${email}` : checkEmailText}</p>
          </div>
        ) : (
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold tracking-tight">{welcomeText}</h2>
            <p className="mt-2 text-sm text-gray-600">{promptText}</p>
          </div>
        )}
        {message && <MessageAlert type={message.type}>{message.text}</MessageAlert>}
        {verifyingOtp ? (
          <OtpVerificationForm
            otp={otp}
            onOtpChange={(e) => setOtp(e.target.value)}
            onSubmit={handleVerifyOtp}
            onResendClick={handleResendOtp}
            loading={loading}
            submitText={verifyCodeText}
            loadingText={verifyingText}
            otpLabel={otpLabelText}
            otpPlaceholder={otpPlaceholderText}
            resendText={resendCodeText}
          />
        ) : (
          <AuthForm
            email={email}
            onEmailChange={setEmail}
            onSubmit={handleEmailAuth}
            loading={loading}
            submitText={sendCodeText}
            loadingText={sendingText}
            emailLabel={emailLabelText}
            emailPlaceholder={emailPlaceholderText}
            isLogin={isLogin}
          />
        )}
      </div>
      <Consent />
    </AuthLayout>
  )
}
