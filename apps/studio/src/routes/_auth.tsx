import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import LoginLoading from '@valguide/features/auth/login/loading'
import { currentUserQueryOptions } from '@valguide/features/auth/query-options'
import { Suspense } from 'react'
import { z } from 'zod'

const authSearchSchema = z.object({
  next: z.string().optional(),
  email: z.string().optional(),
})

export const Route = createFileRoute('/_auth')({
  validateSearch: authSearchSchema,
  beforeLoad: async ({ context, search }) => {
    const user = await context.queryClient.ensureQueryData(currentUserQueryOptions())
    if (user) {
      throw redirect({
        to: search.next ?? '/guides',
      })
    }
  },
  component: AuthLayout,
  pendingComponent: LoginLoading,
})

function AuthLayout() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <Outlet />
    </Suspense>
  )
}
