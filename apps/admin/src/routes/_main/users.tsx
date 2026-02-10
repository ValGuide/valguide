import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { adminUpdateUserStatusFn } from '@valguide/core/features/admin/users/update-user-status.fn'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@valguide/ui/components/select'
import { toast } from '@valguide/ui/components/sonner/state'
import { Users } from 'lucide-react'
import { useState } from 'react'
import { z } from 'zod'
import { BlockUserDialog } from '@/features/admin/components/block-user-dialog'
import { UsersTable } from '@/features/admin/components/users-table'
import { adminUsersQueryOptions } from '@/features/admin/users-query-options'

const usersSearchSchema = z.object({
  status: z.enum(['pending', 'approved', 'blocked']).optional(),
})

export const Route = createFileRoute('/_main/users')({
  validateSearch: usersSearchSchema,
  loaderDeps: ({ search }) => ({ status: search.status }),
  loader: ({ context, deps }) => {
    context.queryClient.ensureQueryData(adminUsersQueryOptions(deps.status))
  },
  component: UsersPage,
})

function UsersPage() {
  const { status } = Route.useSearch()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: users } = useSuspenseQuery(adminUsersQueryOptions(status))

  const [blockTarget, setBlockTarget] = useState<{ userId: string; email: string | null } | null>(null)
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: (input: { userId: string; status: 'approved' | 'blocked'; blockedReason?: string }) =>
      adminUpdateUserStatusFn({ data: input }),
    onMutate: ({ userId }) => setUpdatingUserId(userId),
    onSuccess: (_, { status: newStatus }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      toast.success(newStatus === 'approved' ? 'User approved' : 'User blocked')
      setBlockTarget(null)
    },
    onError: () => {
      toast.error('Failed to update user status')
    },
    onSettled: () => setUpdatingUserId(null),
  })

  const pendingCount = users.filter((u) => u.status === 'pending').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="size-6" />
          <h1 className="text-2xl font-bold">Users</h1>
        </div>
        <Select
          value={status ?? 'all'}
          onValueChange={(value) =>
            navigate({
              to: '/users',
              search: value === 'all' ? {} : { status: value as 'pending' | 'approved' | 'blocked' },
            })
          }
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="blocked">Blocked</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {!status && pendingCount > 0 && (
        <button
          type="button"
          className="w-full rounded-lg border border-warning/20 bg-warning/5 px-4 py-3 text-left text-sm font-medium text-warning"
          onClick={() => navigate({ to: '/users', search: { status: 'pending' } })}
        >
          {pendingCount} user{pendingCount !== 1 ? 's' : ''} pending approval
        </button>
      )}

      <div className="rounded-lg border">
        <UsersTable
          users={users}
          isUpdating={updatingUserId}
          onApprove={(userId) => mutation.mutate({ userId, status: 'approved' })}
          onBlock={(userId, email) => setBlockTarget({ userId, email })}
          onUnblock={(userId) => mutation.mutate({ userId, status: 'approved' })}
        />
      </div>

      <BlockUserDialog
        open={blockTarget !== null}
        onOpenChange={(open) => !open && setBlockTarget(null)}
        userEmail={blockTarget?.email ?? null}
        isBlocking={mutation.isPending}
        onConfirm={(reason) => {
          if (blockTarget) {
            mutation.mutate({ userId: blockTarget.userId, status: 'blocked', blockedReason: reason || undefined })
          }
        }}
      />
    </div>
  )
}
