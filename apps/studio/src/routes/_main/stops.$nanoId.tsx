import { createFileRoute, notFound, Outlet } from '@tanstack/react-router'
import { StopNotFound } from '@/features/stops/components/stop-not-found'
import { stopDetailQueryOptions } from '@/features/stops/query-options'

export const Route = createFileRoute('/_main/stops/$nanoId')({
  staticData: { focusMode: true },
  loader: async ({ params, context }) => {
    try {
      const stopDetail = await context.queryClient.ensureQueryData(stopDetailQueryOptions(params.nanoId))
      if (!stopDetail) {
        throw notFound()
      }
      return { stopDetail }
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw notFound()
      }
      throw error
    }
  },
  notFoundComponent: StopNotFound,
  component: () => <Outlet />,
})
