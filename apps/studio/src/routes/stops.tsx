import { createFileRoute } from '@tanstack/react-router'
import { StopsListContainer } from '@/features/stops'

export const Route = createFileRoute('/stops')({
  component: StopsPage,
})

function StopsPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <StopsListContainer />
    </main>
  )
}
