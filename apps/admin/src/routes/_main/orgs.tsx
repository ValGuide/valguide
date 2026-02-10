import { createFileRoute } from '@tanstack/react-router'
import { Building2 } from 'lucide-react'

export const Route = createFileRoute('/_main/orgs')({
  component: OrgsPage,
})

function OrgsPage() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="text-center">
        <Building2 className="mx-auto mb-4 size-12 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Organizations</h1>
        <p className="text-muted-foreground mt-2">Coming soon</p>
      </div>
    </div>
  )
}
