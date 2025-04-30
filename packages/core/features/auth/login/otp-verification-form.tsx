import { ChangeEvent, FormEvent, useCallback } from 'react'
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
   * Text for the submit button
   */
  submitText: string
  /**
   * Text for the submit button when loading
   */
  loadingText: string
  /**
   * Title for the form
   */
  title?: string
  /**
   * Label for the OTP input
   */
  otpLabel: string
  /**
   * Placeholder for the OTP input
   */
  otpPlaceholder: string
  /**
   * Text for the resend button
   */
  resendText: string
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
  submitText,
  loadingText,
  title,
  otpLabel,
  otpPlaceholder,
  resendText,
}: OtpVerificationFormProps) {
  return (
    <>
      {title && <h2 className="text-center text-2xl font-bold text-gray-900 mb-4">{title}</h2>}
      <form className="mt-8 space-y-6" onSubmit={onSubmit}>
        <div>
          <label htmlFor="otp" className="block text-sm font-medium text-gray-700 text-center">
            {otpLabel}
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
            {loading ? loadingText : submitText}
          </Button>
        </div>
      </form>

      <div className="text-center mt-4">
        <button
          type="button"
          onClick={onResendClick}
          disabled={loading}
          className="text-sm text-indigo-600 hover:text-indigo-500"
        >
          {resendText}
        </button>
      </div>
    </>
  )
}
