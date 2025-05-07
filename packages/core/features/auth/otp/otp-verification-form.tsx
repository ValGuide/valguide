import { ChangeEvent, FormEvent, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@valguide/ui/components/button'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@valguide/ui/components/input-otp'

export interface OtpVerificationFormProps {
  /**
   * The OTP value
   */
  otp: string
  /**
   * Callback when OTP changes
   */
  onOtpChange: (e: ChangeEvent<HTMLInputElement>) => void
  /**
   * Callback when form is submitted
   */
  onSubmit: (e: FormEvent) => void
  /**
   * Callback when resend button is clicked
   */
  onResendClick: () => void
  /**
   * Whether the form is in loading state
   */
  loading?: boolean
  /**
   * Title for the form
   */
  title?: string
  /**
   * Whether this is a login form (true) or signup form (false)
   */
  isLogin?: boolean
}

/**
 * A form component for OTP verification
 */
export function OtpVerificationForm({
  otp,
  onOtpChange,
  onSubmit,
  onResendClick,
  loading = false,
  title,
  isLogin = false,
}: OtpVerificationFormProps) {
  // Get translations based on isLogin prop
  const t = useTranslations(isLogin ? 'login' : 'signup')
  return (
    <>
      {title && <h2 className="text-center text-2xl font-bold text-gray-900 mb-4">{title}</h2>}
      <form className="mt-8 space-y-6" onSubmit={onSubmit}>
        <div>
          <label htmlFor="otp" className="block text-sm font-medium text-gray-700 text-center">
            {t('otpLabel')}
          </label>
          <div className="mt-1 flex justify-center">
            <InputOTP
              maxLength={6}
              disabled={loading}
              onComplete={(value) => {
                // Create a synthetic event to maintain compatibility with the existing API
                const syntheticEvent = {
                  target: {
                    value,
                  },
                } as unknown as ChangeEvent<HTMLInputElement>
                onOtpChange(syntheticEvent)
              }}
              onChange={(value) => {
                // Also handle partial OTP entries
                const syntheticEvent = {
                  target: {
                    value,
                  },
                } as unknown as ChangeEvent<HTMLInputElement>
                onOtpChange(syntheticEvent)
              }}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
        </div>

        <div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t('verifying') : t('verifyCode')}
          </Button>
        </div>
      </form>

      <div className="text-center mt-4">
        <span className="text-sm text-gray-600">
          {/* TODO: Add translation key for this text */}
          Didn't receive the email? Check your SPAM folder or{' '}
          <button
            type="button"
            onClick={onResendClick}
            disabled={loading}
            className="text-indigo-600 hover:text-indigo-500 inline"
          >
            {t('resendCode')}
          </button>
        </span>
      </div>
    </>
  )
}
