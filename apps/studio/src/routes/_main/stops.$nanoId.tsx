import { createFileRoute, notFound, Outlet } from '@tanstack/react-router'
import { StopNotFound } from '@/features/stops/components/stop-not-found'
import { stopMetadataQueryOptions } from '@/features/stops/query-options'

export const Route = createFileRoute('/_main/stops/$nanoId')({
  staticData: { focusMode: true },
  loader: async ({ params, context }) => {
    try {
      const metadata = await context.queryClient.ensureQueryData(stopMetadataQueryOptions(params.nanoId))
      if (!metadata) {
        throw notFound()
      }
      return { metadata }
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
