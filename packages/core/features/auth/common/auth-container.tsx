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
  loading: boolean
  message: { type: 'success' | 'error'; text: string } | null
  verifyingOtp: boolean
  isLogin: boolean
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
  loading,
  message,
  verifyingOtp,
  isLogin,
}: AuthContainerProps) {
  const t = useTranslations(isLogin ? 'login' : 'signup')

  return (
    <AuthLayout footer={<Consent />}>
      <div className="flex flex-1 flex-col justify-center gap-6">
        {verifyingOtp ? (
          <div className="text-center">
            <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">ValGuide</p>
            <h2 className="mt-3 text-3xl tracking-tight font-serif">{t('otpTitle')}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {email ? `${t('verifyEmail')} ${email}` : t('checkEmail')}
            </p>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">ValGuide</p>
            <h2 className="mt-3 text-3xl tracking-tight font-serif">{t('welcome')}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{t(isLogin ? 'loginPrompt' : 'signupPrompt')}</p>
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
            isLogin={isLogin}
          />
        ) : (
          <AuthForm
            email={email}
            onEmailChange={setEmail}
            onSubmit={handleEmailAuth}
            loading={loading}
            submitText={t('sendCode')}
            loadingText={t('sending')}
            emailLabel={t('emailLabel')}
            emailPlaceholder={t('emailPlaceholder')}
            isLogin={isLogin}
          />
        )}
      </div>
    </AuthLayout>
  )
}
