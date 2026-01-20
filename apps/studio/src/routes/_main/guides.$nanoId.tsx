import { createFileRoute, notFound, Outlet } from '@tanstack/react-router'
import { GuideNotFound } from '@/features/guides/components/guide-not-found'
import { guideMetadataQueryOptions } from '@/features/guides/query-options'

export const Route = createFileRoute('/_main/guides/$nanoId')({
  loader: async ({ params, context }) => {
    try {
      const metadata = await context.queryClient.ensureQueryData(guideMetadataQueryOptions(params.nanoId))
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
  notFoundComponent: GuideNotFound,
  component: () => <Outlet />,
})
