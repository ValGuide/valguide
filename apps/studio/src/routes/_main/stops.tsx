import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/stops')({
  component: () => <Outlet />,
})
