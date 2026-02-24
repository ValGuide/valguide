import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import LoginLoading from '@valguide/features/auth/login/loading'
import { isAuthenticatedQueryOptions } from '@valguide/features/auth/query-options'
import { z } from 'zod'

const authSearchSchema = z.object({
  next: z.string().optional(),
  email: z.string().optional(),
})

export const Route = createFileRoute('/_auth')({
  validateSearch: authSearchSchema,
  beforeLoad: async ({ context, search }) => {
    const isAuthenticated = await context.queryClient.ensureQueryData(isAuthenticatedQueryOptions())
    if (isAuthenticated) {
      throw redirect({
        to: search.next ?? '/tours',
      })
    }
  },
  component: AuthLayout,
  pendingComponent: LoginLoading,
})

function AuthLayout() {
  return <Outlet />
}
