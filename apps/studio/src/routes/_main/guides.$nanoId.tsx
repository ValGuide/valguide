import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/guides/$nanoId')({
  component: () => <Outlet />,
})
