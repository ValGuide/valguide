import { useTranslations } from '@valguide/core/i18n/client'
import { OtpVerificationForm } from '../otp/otp-verification-form'
import { AuthForm } from './auth-form'
import { AuthLayout } from './auth-layout'
import { Consent } from './consent'
import { MessageAlert } from './message-alert'

export interface AuthContainerProps {
  // Auth state and handlers
  email: string
  setEmail: (email: string) => void
  otp: string
  setOtp: (otp: string) => void
  handleEmailAuth: (email: string) => void
  handleVerifyOtp: (e: React.FormEvent) => void
  handleResendOtp: () => void
  handleChangeEmail: () => void
  loading: boolean
  message: { type: 'success' | 'error'; text: string } | null
  verifyingOtp: boolean
}

export function AuthContainer({
  // Auth state and handlers
  email,
  setEmail,
  otp,
  setOtp,
  handleEmailAuth,
  handleVerifyOtp,
  handleResendOtp,
  handleChangeEmail,
  loading,
  message,
  verifyingOtp,
}: AuthContainerProps) {
  const t = useTranslations('auth')

  return (
    <AuthLayout footer={<Consent />}>
      <div className="flex flex-1 flex-col justify-center gap-6">
        {verifyingOtp ? (
          <div className="text-center">
            <h2 className="text-3xl tracking-tight font-serif">{t('otpTitle')}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{email ? t('otpSubtitle', { email }) : t('otpTitle')}</p>
          </div>
        ) : (
          <div className="text-center">
            <h2 className="text-3xl tracking-tight font-serif">{t('title')}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{t('subtitle')}</p>
          </div>
        )}
        {message && <MessageAlert type={message.type}>{message.text}</MessageAlert>}
        {verifyingOtp ? (
          <OtpVerificationForm
            otp={otp}
            onOtpChange={(e) => setOtp(e.target.value)}
            onSubmit={handleVerifyOtp}
            onResendClick={handleResendOtp}
            onChangeEmail={handleChangeEmail}
            loading={loading}
          />
        ) : (
          <AuthForm email={email} onEmailChange={setEmail} onSubmit={handleEmailAuth} loading={loading} />
        )}
      </div>
    </AuthLayout>
  )
}
