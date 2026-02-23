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

export const Route = createFileRoute('/_main/approved-domains')({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(approvedDomainsQueryOptions())
  },
  component: ApprovedDomainsPage,
})

function ApprovedDomainsPage() {
  const queryClient = useQueryClient()
  const { data: domains } = useSuspenseQuery(approvedDomainsQueryOptions())

  const [dialogOpen, setDialogOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const addMutation = useMutation({
    mutationFn: (domain: string) => addApprovedDomainFn({ data: { domain } }),
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
        <Button onClick={() => setDialogOpen(true)}>Add Domain</Button>
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
        isAdding={addMutation.isPending}
        onConfirm={(domain) => addMutation.mutate(domain)}
      />
    </div>
  )
}
