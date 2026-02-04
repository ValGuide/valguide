import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/tours/$nanoId')({
  staticData: { focusMode: true },
  component: () => <Outlet />,
})
