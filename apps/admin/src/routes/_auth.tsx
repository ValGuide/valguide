import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import LoginLoading from '@valguide/features/auth/login/loading'
import { Suspense } from 'react'
import { z } from 'zod'

const authSearchSchema = z.object({
  next: z.string().optional(),
  email: z.string().optional(),
})

export const Route = createFileRoute('/_auth')({
  validateSearch: authSearchSchema,
  beforeLoad: ({ context, search }) => {
    if (context.user) {
      throw redirect({
        to: search.next ?? '/assets',
      })
    }
  },
  component: AuthLayout,
})

function AuthLayout() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <Outlet />
    </Suspense>
  )
}
