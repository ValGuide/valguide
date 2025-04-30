import { ReactNode } from 'react'

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
    <div className={`p-4 rounded-md ${type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
      {children}
    </div>
  )
}
