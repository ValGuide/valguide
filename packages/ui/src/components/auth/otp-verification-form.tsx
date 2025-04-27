import { ChangeEvent, FormEvent } from 'react'
import { Button } from '../button'

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
  otpLabel,
  otpPlaceholder,
  resendText,
}: OtpVerificationFormProps) {
  return (
    <>
      <form className="mt-8 space-y-6" onSubmit={onSubmit}>
        <div>
          <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
            {otpLabel}
          </label>
          <div className="mt-1">
            <input
              id="otp"
              name="otp"
              type="text"
              required
              value={otp}
              onChange={onOtpChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder={otpPlaceholder}
            />
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
