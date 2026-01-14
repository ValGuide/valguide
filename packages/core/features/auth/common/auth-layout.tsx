import { Card, CardContent } from '@valguide/core/ui/components/card'
import type { ReactNode } from 'react'

export interface AuthLayoutProps {
  /**
   * The form or content to display inside the card
   */
  children: ReactNode
  /**
   * Optional footer content displayed below the card (e.g., terms/privacy)
   */
  footer?: ReactNode
}

/**
 * A layout component for authentication pages with a centered card design.
 */
export function AuthLayout({ children, footer }: AuthLayoutProps) {
  return (
    <main className="min-h-svh flex flex-col items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">{children}</CardContent>
      </Card>
      {footer && <div className="mt-6 text-center">{footer}</div>}
    </main>
  )
}
