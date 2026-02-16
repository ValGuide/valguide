import { useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Outlet, redirect, useRouter } from '@tanstack/react-router'
import { signOutFn } from '@valguide/core/features/auth/sign-out.fn'
import { Separator } from '@valguide/ui/components/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@valguide/ui/components/sidebar'
import { AdminSidebar } from '@/components/admin-sidebar'
import { checkSuperadminFn } from '@/server/functions/check-superadmin.fn'

export const Route = createFileRoute('/_main')({
  beforeLoad: async ({ context, location }) => {
    if (!context.user) {
      throw redirect({
        to: '/login',
        search: { next: location.href },
      })
    }
    const { allowed } = await checkSuperadminFn()
    if (!allowed) {
      await signOutFn({ data: {} })
      throw redirect({ to: '/login' })
    }
  },
  component: MainLayout,
})

function MainLayout() {
  const { user } = Route.useRouteContext()
  const router = useRouter()
  const queryClient = useQueryClient()

  const handleLogout = async () => {
    await signOutFn({ data: {} })
    queryClient.clear()
    await router.invalidate()
    router.navigate({ to: '/login' })
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <AdminSidebar userEmail={user?.email} onLogout={handleLogout} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex flex-1 items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1 md:hidden" />
            <Separator orientation="vertical" className="mr-2 h-4 md:hidden" />
          </div>
        </header>
        <div className="min-h-[calc(100svh-4rem)] flex flex-col px-4 pb-4">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
