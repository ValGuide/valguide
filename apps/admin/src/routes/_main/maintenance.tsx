import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { toast } from '@valguide/ui/components/sonner/state'
import { Wrench } from 'lucide-react'
import { MaintenanceCard } from '@/features/admin/components/maintenance-card'
import { adminMaintenanceQueryOptions } from '@/features/admin/maintenance-query-options'
import { setMaintenanceStatusFn } from '@/server/functions/set-maintenance-status.fn'

export const Route = createFileRoute('/_main/maintenance')({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(adminMaintenanceQueryOptions())
  },
  component: MaintenancePage,
})

function MaintenancePage() {
  const queryClient = useQueryClient()
  const { data, isFetching } = useQuery(adminMaintenanceQueryOptions())

  const mutation = useMutation({
    mutationFn: setMaintenanceStatusFn,
    onSuccess: (result, variables) => {
      queryClient.setQueryData(adminMaintenanceQueryOptions().queryKey, result)
      queryClient.invalidateQueries({ queryKey: adminMaintenanceQueryOptions().queryKey })
      toast.success(
        `${variables.data.app === 'studio' ? 'Studio' : 'App'} maintenance ${variables.data.enabled ? 'enabled' : 'disabled'}`,
      )
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Failed to update maintenance status'
      toast.error(message)
    },
  })

  const status = data ?? {
    studio: { app: 'studio' as const, enabled: false, message: null, eta: null, enabledAt: null, enabledBy: null },
    app: { app: 'app' as const, enabled: false, message: null, eta: null, enabledAt: null, enabledBy: null },
  }

  const pendingTarget = mutation.variables?.data.app

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Wrench className="size-6" />
        <h1 className="text-2xl font-bold">Maintenance</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <MaintenanceCard
          app="studio"
          status={status.studio}
          isPending={mutation.isPending && pendingTarget === 'studio'}
          onSetStatus={(input) => mutation.mutate({ data: input })}
        />
        <MaintenanceCard
          app="app"
          status={status.app}
          isPending={mutation.isPending && pendingTarget === 'app'}
          onSetStatus={(input) => mutation.mutate({ data: input })}
        />
      </div>

      {isFetching && <p className="text-sm text-muted-foreground">Refreshing status…</p>}
    </div>
  )
}
