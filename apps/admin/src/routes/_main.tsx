import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_main')({
  beforeLoad: ({ context, location }) => {
    if (!context.user) {
      throw redirect({
        to: '/login',
        search: { next: location.href },
      })
    }
  },
  component: MainLayout,
})

function MainLayout() {
  return (
    <main className="min-h-svh flex flex-col">
      <Outlet />
    </main>
  )
}
