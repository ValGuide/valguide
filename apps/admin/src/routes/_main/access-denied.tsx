import { useMutation } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { requestAdminAccessFn } from '@valguide/core/features/admin/request-admin-access.fn'
import { Button } from '@valguide/ui/components/button'
import { AlertCircle } from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/_main/access-denied')({
  component: AccessDeniedPage,
})

function AccessDeniedPage() {
  const { user } = Route.useRouteContext()
  const [submitted, setSubmitted] = useState(false)

  const { mutate: requestAccess, isPending } = useMutation({
    mutationFn: async () => {
      await requestAdminAccessFn({ data: {} })
    },
    onSuccess: () => {
      setSubmitted(true)
    },
  })

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="rounded-full bg-destructive/10 p-3">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Access Denied</h1>
          <p className="text-sm text-muted-foreground">You don't have permission to access the admin dashboard yet.</p>
        </div>

        {/* Email info */}
        <div className="rounded-lg border border-border bg-muted/50 p-3">
          <p className="text-sm">
            <span className="font-medium text-foreground">Email:</span>{' '}
            <span className="text-muted-foreground">{user?.email}</span>
          </p>
        </div>

        {/* Message */}
        {submitted ? (
          <div className="rounded-lg border border-success/20 bg-success/5 p-4">
            <p className="text-sm text-success">
              ✓ Your access request has been sent. Our team will review it shortly and get back to you.
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center">
            Click the button below to request admin access. Our team will review your request.
          </p>
        )}

        {/* Button */}
        {!submitted && (
          <Button onClick={() => requestAccess()} disabled={isPending} className="w-full" size="lg">
            {isPending ? 'Sending request...' : 'Request Admin Access'}
          </Button>
        )}

        {/* Help text */}
        <p className="text-xs text-muted-foreground text-center">
          If you believe this is a mistake, please contact support.
        </p>
      </div>
    </div>
  )
}
