import { ChangeEvent, FormEvent } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@valguide/ui/components/button'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from '@valguide/ui/components/input-otp'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@valguide/ui/components/field'

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
    <form onSubmit={onSubmit}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-2 text-center">
          {title && <h1 className="text-xl font-bold">{title}</h1>}
          <FieldDescription>{t('otpLabel')}</FieldDescription>
        </div>
        <Field>
          <FieldLabel htmlFor="otp" className="sr-only">
            {t('otpLabel')}
          </FieldLabel>
          <InputOTP
            maxLength={6}
            id="otp"
            disabled={loading}
            containerClassName="gap-4"
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
            <InputOTPGroup className="gap-2.5 *:data-[slot=input-otp-slot]:h-16 *:data-[slot=input-otp-slot]:w-12 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border *:data-[slot=input-otp-slot]:text-xl">
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup className="gap-2.5 *:data-[slot=input-otp-slot]:h-16 *:data-[slot=input-otp-slot]:w-12 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border *:data-[slot=input-otp-slot]:text-xl">
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
          <FieldDescription className="text-center">
            {t('didntReceiveEmail')}{' '}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault()
                onResendClick()
              }}
            >
              {t('resendCode')}
            </a>
          </FieldDescription>
        </Field>
        <Field>
          <Button type="submit" disabled={loading}>
            {loading ? t('verifying') : t('verifyCode')}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
