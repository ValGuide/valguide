import type { ReactNode } from 'react'

export interface MessageAlertProps {
  /**
   * The type of message to display
   */
  type: 'success' | 'error'
  /**
   * The message text or content
   */
  children: ReactNode
  /**
   * Whether to show the message
   */
  show?: boolean
}

/**
 * A component for displaying success or error messages in authentication forms
 */
export function MessageAlert({ type, children, show = true }: MessageAlertProps) {
  if (!show) return null

  return (
    <div
      className={`mt-4 p-4 rounded-md flex items-start ${
        type === 'success'
          ? 'bg-green-50 text-green-800 border border-green-200'
          : 'bg-red-50 text-red-800 border border-red-200'
      }`}
      role="alert"
    >
      <div className="shrink-0 mr-3">
        {type === 'success' ? (
          <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <svg className="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </div>
      <div className="text-sm font-medium">{children}</div>
    </div>
  )
}
