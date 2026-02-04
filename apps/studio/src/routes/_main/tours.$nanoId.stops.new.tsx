import { createFileRoute, redirect } from '@tanstack/react-router'
import { createStopFn } from '@valguide/core/features/tours/stop/create-stop.fn'
import { addStopToTourFn } from '@valguide/core/features/tours/structure/add-stop.fn'
import { z } from 'zod'
import { tourDetailQueryOptions } from '@/features/tours/query-options'

const searchSchema = z.object({
  locale: z.string().optional(),
})

export const Route = createFileRoute('/_main/tours/$nanoId/stops/new')({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({ locale: search.locale }),
  loader: async ({ params, context, deps }) => {
    const tourDetail = await context.queryClient.ensureQueryData(tourDetailQueryOptions(params.nanoId))
    const locale = deps.locale ?? tourDetail.availableLocales[0] ?? context.locale

    const result = await createStopFn({ data: { locale } })
    await addStopToTourFn({ data: { tourNanoId: params.nanoId, stopNanoId: result.nanoId } })

    await context.queryClient.invalidateQueries({ queryKey: ['tour', params.nanoId, 'structure'] })

    throw redirect({
      to: '/tours/$nanoId/stops/$stopId/edit',
      params: { nanoId: params.nanoId, stopId: result.nanoId },
      search: { locale },
      replace: true,
    })
  },
})
