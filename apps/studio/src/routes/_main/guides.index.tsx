import { createFileRoute } from '@tanstack/react-router'

import { GuidesListContainer } from '@/features/guides'
import { GuidesListSkeleton } from '@/features/guides/components/guides-list-skeleton'
import { guidesListQueryOptions } from '@/features/guides/query-options'

export const Route = createFileRoute('/_main/guides/')({
  loader: ({ context }) => {
    const locale = context.locale
    const options = guidesListQueryOptions(locale)
    const cachedData = context.queryClient.getQueryData(options.queryKey)
    if (cachedData) {
      context.queryClient.invalidateQueries({ queryKey: options.queryKey })
      return cachedData
    }
    return context.queryClient.ensureQueryData(options)
  },
  component: GuidesPage,
  pendingComponent: GuidesListSkeleton,
})

function GuidesPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <GuidesListContainer />
    </main>
  )
}
