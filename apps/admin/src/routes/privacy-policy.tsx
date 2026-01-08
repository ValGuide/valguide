import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/privacy-policy')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold">Coming Soon</h1>
    </div>
  )
}
