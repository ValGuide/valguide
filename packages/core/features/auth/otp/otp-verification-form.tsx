import { useTranslations } from '@valguide/core/i18n/client'
import { Button } from '@valguide/ui/components/button'
import { Field, FieldGroup, FieldLabel } from '@valguide/ui/components/field'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@valguide/ui/components/input-otp'
import type { ChangeEvent, FormEvent } from 'react'

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
   * Callback when change email button is clicked
   */
  onChangeEmail?: () => void
  /**
   * Whether the form is in loading state
   */
  loading?: boolean
  /**
   * Title for the form
   */
  title?: string
}

/**
 * A form component for OTP verification
 */
export function OtpVerificationForm({
  otp: _otp,
  onOtpChange,
  onSubmit,
  onResendClick,
  onChangeEmail,
  loading = false,
  title,
}: OtpVerificationFormProps) {
  const t = useTranslations('auth')
  return (
    <form onSubmit={onSubmit}>
      <FieldGroup>
        {title && (
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-xl font-bold">{title}</h1>
          </div>
        )}
        <Field>
          <FieldLabel htmlFor="otp" className="sr-only">
            {t('otpPlaceholder')}
          </FieldLabel>
          <InputOTP
            maxLength={6}
            id="otp"
            disabled={loading}
            containerClassName="gap-2 sm:gap-4 justify-center"
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
            <InputOTPGroup className="gap-1.5 sm:gap-2.5 *:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-10 sm:*:data-[slot=input-otp-slot]:h-16 sm:*:data-[slot=input-otp-slot]:w-12 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border *:data-[slot=input-otp-slot]:text-lg sm:*:data-[slot=input-otp-slot]:text-xl">
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPGroup className="gap-1.5 sm:gap-2.5 *:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-10 sm:*:data-[slot=input-otp-slot]:h-16 sm:*:data-[slot=input-otp-slot]:w-12 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border *:data-[slot=input-otp-slot]:text-lg sm:*:data-[slot=input-otp-slot]:text-xl">
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </Field>
        <Field>
          <Button type="submit" disabled={loading}>
            {loading ? t('verifying') : t('verifyCode')}
          </Button>
        </Field>
        <p className="text-center text-xs text-muted-foreground">{t('deliveryNote')}</p>
        <div className="text-center text-sm">
          <span>{t('didntReceive')} </span>
          <button type="button" className="font-medium hover:underline" onClick={onResendClick}>
            {t('resendCode')}
          </button>
          {onChangeEmail && (
            <>
              <span className="mx-2">·</span>
              <button type="button" className="font-medium hover:underline" onClick={onChangeEmail}>
                {t('changeEmail')}
              </button>
            </>
          )}
        </div>
      </FieldGroup>
    </form>
  )
}
