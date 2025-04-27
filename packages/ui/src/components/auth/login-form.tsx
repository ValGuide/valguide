import { ChangeEvent, FormEvent } from 'react'
import { Button } from '../button'

export interface LoginFormProps {
  /**
   * The email value
   */
  email: string
  /**
   * Callback when email changes
   */
  onEmailChange: (e: ChangeEvent<HTMLInputElement>) => void
  /**
   * Callback when form is submitted
   */
  onSubmit: (e: FormEvent) => void
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
   * Label for the email input
   */
  emailLabel: string
  /**
   * Placeholder for the email input
   */
  emailPlaceholder: string
}

/**
 * A form component for email login
 */
export function LoginForm({
  email,
  onEmailChange,
  onSubmit,
  loading = false,
  submitText,
  loadingText,
  emailLabel,
  emailPlaceholder,
}: LoginFormProps) {
  return (
    <form className="mt-8 space-y-6" onSubmit={onSubmit}>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          {emailLabel}
        </label>
        <div className="mt-1">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={onEmailChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder={emailPlaceholder}
          />
        </div>
      </div>

      <div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? loadingText : submitText}
        </Button>
      </div>
    </form>
  )
}
