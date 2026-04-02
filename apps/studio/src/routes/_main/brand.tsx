import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/brand')({
  beforeLoad: ({ location }) => {
    if (location.pathname === '/brand' || location.pathname === '/brand/') {
      throw redirect({ to: '/brand/theme' })
    }
  },
  component: Outlet,
})
