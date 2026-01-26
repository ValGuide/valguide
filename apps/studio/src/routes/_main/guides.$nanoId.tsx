import { createFileRoute, notFound, Outlet } from '@tanstack/react-router'
import { GuideNotFound } from '@/features/guides/components/guide-not-found'
import { guideDetailQueryOptions } from '@/features/guides/query-options'

export const Route = createFileRoute('/_main/guides/$nanoId')({
  staticData: { focusMode: true },
  loader: async ({ params, context }) => {
    try {
      const guideDetail = await context.queryClient.ensureQueryData(guideDetailQueryOptions(params.nanoId))
      if (!guideDetail) {
        throw notFound()
      }
      return { guideDetail }
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw notFound()
      }
      throw error
    }
  },
  notFoundComponent: GuideNotFound,
  component: () => <Outlet />,
})
