import { createFileRoute } from '@tanstack/react-router'

import { GuidesListContainer } from '@/features/guides'

export const Route = createFileRoute('/_main/guides')({
  component: GuidesPage,
})

function GuidesPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <GuidesListContainer />
    </main>
  )
}
