import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@valguide/ui/components/button'
import { toast } from '@valguide/ui/components/sonner/state'
import { ArrowLeft, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { AddMemberDialog } from '@/features/admin/components/add-member-dialog'
import { OrgDetailHeader } from '@/features/admin/components/org-detail-header'
import { OrgMembersTable } from '@/features/admin/components/org-members-table'
import { RemoveMemberDialog } from '@/features/admin/components/remove-member-dialog'
import { adminOrgDetailQueryOptions, adminOrgMembersQueryOptions } from '@/features/admin/org-detail-query-options'
import { adminAddMemberFn } from '@/server/functions/admin-add-member.fn'
import { adminRemoveMemberFn } from '@/server/functions/admin-remove-member.fn'
import { adminUpdateMemberRoleFn } from '@/server/functions/admin-update-member-role.fn'

export const Route = createFileRoute('/_main/orgs_/$nanoId')({
  loader: ({ context, params }) => {
    context.queryClient.ensureQueryData(adminOrgDetailQueryOptions(params.nanoId))
    context.queryClient.ensureQueryData(adminOrgMembersQueryOptions(params.nanoId))
  },
  component: OrgDetailPage,
})

function OrgDetailPage() {
  const { nanoId } = Route.useParams()
  const queryClient = useQueryClient()

  const { data: org } = useQuery(adminOrgDetailQueryOptions(nanoId))
  const { data: members } = useQuery(adminOrgMembersQueryOptions(nanoId))

  // Role change mutation
  const [updatingMemberId, setUpdatingMemberId] = useState<string | null>(null)

  const roleMutation = useMutation({
    mutationFn: (input: { memberId: string; role: string }) =>
      adminUpdateMemberRoleFn({
        data: { memberId: input.memberId, role: input.role as 'owner' | 'admin' | 'curator' | 'editor' | 'viewer' },
      }),
    onMutate: ({ memberId }) => setUpdatingMemberId(memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'org-members', nanoId] })
      toast.success('Role updated')
    },
    onError: () => {
      toast.error('Failed to update role')
    },
    onSettled: () => setUpdatingMemberId(null),
  })

  // Remove member mutation
  const [removeTarget, setRemoveTarget] = useState<{ memberId: string; email: string | null } | null>(null)

  const removeMutation = useMutation({
    mutationFn: (memberId: string) => adminRemoveMemberFn({ data: { memberId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'org-members', nanoId] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'org-detail', nanoId] })
      toast.success('Member removed')
      setRemoveTarget(null)
    },
    onError: () => {
      toast.error('Failed to remove member')
    },
  })

  // Add member mutation
  const [showAddDialog, setShowAddDialog] = useState(false)

  const addMutation = useMutation({
    mutationFn: (input: { email: string; role: string }) =>
      adminAddMemberFn({
        data: {
          orgNanoId: nanoId,
          email: input.email,
          role: input.role as 'owner' | 'admin' | 'curator' | 'editor' | 'viewer',
        },
      }),
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.error ?? 'Failed to add member')
        return
      }
      queryClient.invalidateQueries({ queryKey: ['admin', 'org-members', nanoId] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'org-detail', nanoId] })
      toast.success('Member added')
      setShowAddDialog(false)
    },
    onError: () => {
      toast.error('Failed to add member')
    },
  })

  if (!org) {
    return (
      <div className="space-y-6">
        <Link to="/orgs" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" />
          Back to Organizations
        </Link>
        <p className="text-muted-foreground">Organization not found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Link to="/orgs" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" />
        Back to Organizations
      </Link>

      <OrgDetailHeader org={org} />

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Members</h2>
        <Button size="sm" onClick={() => setShowAddDialog(true)}>
          <UserPlus className="mr-2 size-4" />
          Add Member
        </Button>
      </div>

      <OrgMembersTable
        members={members ?? []}
        onRoleChange={(memberId, role) => roleMutation.mutate({ memberId, role })}
        onRemove={(memberId, email) => setRemoveTarget({ memberId, email })}
        updatingMemberId={updatingMemberId}
      />

      <RemoveMemberDialog
        open={removeTarget !== null}
        onOpenChange={(open) => !open && setRemoveTarget(null)}
        memberEmail={removeTarget?.email ?? null}
        isRemoving={removeMutation.isPending}
        onConfirm={() => {
          if (removeTarget) {
            removeMutation.mutate(removeTarget.memberId)
          }
        }}
      />

      <AddMemberDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        isAdding={addMutation.isPending}
        onConfirm={(email, role) => addMutation.mutate({ email, role })}
      />
    </div>
  )
}
