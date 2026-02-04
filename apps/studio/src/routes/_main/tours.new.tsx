import { createFileRoute, redirect } from '@tanstack/react-router'
import { createTourFn } from '@valguide/core/features/tours/tour/create-tour.fn'
import { z } from 'zod'

const searchSchema = z.object({
  locale: z.string().optional(),
})

export const Route = createFileRoute('/_main/tours/new')({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({ locale: search.locale }),
  loader: async ({ context, deps }) => {
    const locale = deps.locale ?? context.locale
    const result = await createTourFn({ data: { locale } })

    await context.queryClient.invalidateQueries({ queryKey: ['tours'] })

    throw redirect({
      to: '/tours/$nanoId/edit',
      params: { nanoId: result.nanoId },
      search: { locale: result.locale },
      replace: true,
    })
  },
})
