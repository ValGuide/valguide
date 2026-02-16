import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@valguide/ui/components/button'
import { toast } from '@valguide/ui/components/sonner/state'
import { Globe } from 'lucide-react'
import { useState } from 'react'
import { approvedDomainsQueryOptions } from '@/features/admin/approved-domains-query-options'
import { AddApprovedDomainDialog } from '@/features/admin/components/add-approved-domain-dialog'
import { ApprovedDomainsTable } from '@/features/admin/components/approved-domains-table'
import { addApprovedDomainFn } from '@/server/functions/add-approved-domain.fn'
import { deleteApprovedDomainFn } from '@/server/functions/delete-approved-domain.fn'
import { getUserTeamsFn } from '@/server/functions/get-user-teams.fn'

const userTeamsQueryOptions = () => ({
  queryKey: ['user', 'teams'],
  queryFn: () => getUserTeamsFn(),
})

export const Route = createFileRoute('/_main/approved-domains')({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(approvedDomainsQueryOptions())
    context.queryClient.ensureQueryData(userTeamsQueryOptions())
  },
  component: ApprovedDomainsPage,
})

function ApprovedDomainsPage() {
  const queryClient = useQueryClient()
  const { data: domains } = useSuspenseQuery(approvedDomainsQueryOptions())
  const { data: teams } = useSuspenseQuery(userTeamsQueryOptions())

  const [dialogOpen, setDialogOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const addMutation = useMutation({
    mutationFn: (input: { organizationId: string; domain: string }) => addApprovedDomainFn({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'approved-domains'] })
      toast.success('Domain approved')
      setDialogOpen(false)
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : 'Failed to add domain'
      toast.error(message)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (domainId: string) => deleteApprovedDomainFn({ data: { domainId } }),
    onMutate: (domainId) => setDeletingId(domainId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'approved-domains'] })
      toast.success('Domain removed')
    },
    onError: () => {
      toast.error('Failed to remove domain')
    },
    onSettled: () => setDeletingId(null),
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Globe className="size-6" />
          <h1 className="text-2xl font-bold">Approved Domains</h1>
        </div>
        <Button onClick={() => setDialogOpen(true)} disabled={teams.length === 0}>
          Add Domain
        </Button>
      </div>

      <div className="rounded-lg border">
        <ApprovedDomainsTable
          domains={domains}
          isDeletingId={deletingId}
          onDelete={(domainId) => deleteMutation.mutate(domainId)}
        />
      </div>

      <AddApprovedDomainDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        organizations={teams.map((team) => ({ id: team.id, name: team.name }))}
        isAdding={addMutation.isPending}
        onConfirm={(organizationId, domain) => addMutation.mutate({ organizationId, domain })}
      />
    </div>
  )
}
