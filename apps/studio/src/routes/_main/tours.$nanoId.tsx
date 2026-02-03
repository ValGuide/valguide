import { createFileRoute, notFound, Outlet } from '@tanstack/react-router'
import { TourNotFound } from '@/features/tours/components/tour-not-found'
import { tourDetailQueryOptions } from '@/features/tours/query-options'

export const Route = createFileRoute('/_main/tours/$nanoId')({
  staticData: { focusMode: true },
  loader: async ({ params, context }) => {
    try {
      const tourDetail = await context.queryClient.ensureQueryData(tourDetailQueryOptions(params.nanoId))
      if (!tourDetail) {
        throw notFound()
      }
      return { tourDetail }
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw notFound()
      }
      throw error
    }
  },
  notFoundComponent: TourNotFound,
  component: () => <Outlet />,
})
