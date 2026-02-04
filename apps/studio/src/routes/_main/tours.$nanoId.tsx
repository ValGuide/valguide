import { createFileRoute, notFound, Outlet, redirect } from '@tanstack/react-router'
import { createTourFn } from '@valguide/core/features/tours/tour/create-tour.fn'
import { z } from 'zod'
import { TourNotFound } from '@/features/tours/components/tour-not-found'
import { tourDetailQueryOptions } from '@/features/tours/query-options'

const searchSchema = z.object({
  new: z.boolean().optional(),
  locale: z.string().optional(),
})

export const Route = createFileRoute('/_main/tours/$nanoId')({
  staticData: { focusMode: true },
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({ isNew: search.new, locale: search.locale }),
  loader: async ({ params, context, deps }) => {
    const tourDetail = await context.queryClient
      .ensureQueryData(tourDetailQueryOptions(params.nanoId))
      .catch(() => null)

    if (tourDetail) {
      return { tourDetail }
    }

    if (deps.isNew) {
      const locale = deps.locale ?? context.locale
      await createTourFn({ data: { nanoId: params.nanoId, locale } })
      await context.queryClient.invalidateQueries({ queryKey: ['tours'] })

      throw redirect({
        to: '/tours/$nanoId/edit',
        params: { nanoId: params.nanoId },
        search: { locale },
        replace: true,
      })
    }

    throw notFound()
  },
  notFoundComponent: TourNotFound,
  component: () => <Outlet />,
})
