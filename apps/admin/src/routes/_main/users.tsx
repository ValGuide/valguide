import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import type { PaginationState, SortingState } from '@tanstack/react-table'
import type { ListUsersInput } from '@valguide/core/features/admin/users/list-users.fn'
import { adminUpdateUserStatusFn } from '@valguide/core/features/admin/users/update-user-status.fn'
import { toast } from '@valguide/ui/components/sonner/state'
import { Users } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { z } from 'zod'
import { BlockUserDialog } from '@/features/admin/components/block-user-dialog'
import { UsersDataTable } from '@/features/admin/components/users-data-table'
import { adminUsersQueryOptions } from '@/features/admin/users-query-options'

const usersSearchSchema = z.object({
  status: z.enum(['pending', 'approved', 'blocked']).optional(),
  search: z.string().optional(),
  page: z.number().int().min(0).optional(),
  pageSize: z.number().int().min(1).max(100).optional(),
  sortBy: z.enum(['email', 'name', 'status', 'createdAt', 'orgCount']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
})

function buildInput(search: z.infer<typeof usersSearchSchema>): ListUsersInput {
  return {
    page: search.page ?? 0,
    pageSize: search.pageSize ?? 20,
    search: search.search,
    status: search.status,
    sortBy: search.sortBy ?? 'createdAt',
    sortOrder: search.sortOrder ?? 'desc',
  }
}

export const Route = createFileRoute('/_main/users')({
  validateSearch: usersSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) => {
    context.queryClient.ensureQueryData(adminUsersQueryOptions(buildInput(deps)))
  },
  component: UsersPage,
})

function UsersPage() {
  const searchParams = Route.useSearch()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const input = buildInput(searchParams)
  const { data, isFetching } = useQuery(adminUsersQueryOptions(input))

  const users = data?.users ?? []
  const totalCount = data?.totalCount ?? 0

  // Debounced search
  const [searchValue, setSearchValue] = useState(searchParams.search ?? '')

  // Sync search input when URL changes externally (e.g., browser back)
  useEffect(() => {
    setSearchValue(searchParams.search ?? '')
  }, [searchParams.search])

  useEffect(() => {
    const timeout = setTimeout(() => {
      const current = searchParams.search ?? ''
      if (searchValue !== current) {
        navigate({
          to: '/users',
          search: (prev) => ({ ...prev, search: searchValue || undefined, page: 0 }),
        })
      }
    }, 300)
    return () => clearTimeout(timeout)
  }, [searchValue, searchParams.search, navigate])

  // Pagination state
  const pagination: PaginationState = {
    pageIndex: searchParams.page ?? 0,
    pageSize: searchParams.pageSize ?? 20,
  }

  const onPaginationChange = useCallback(
    (updater: PaginationState | ((old: PaginationState) => PaginationState)) => {
      const next = typeof updater === 'function' ? updater(pagination) : updater
      navigate({
        to: '/users',
        search: (prev) => ({ ...prev, page: next.pageIndex, pageSize: next.pageSize }),
      })
    },
    [navigate, pagination],
  )

  // Sorting state
  const sorting: SortingState = searchParams.sortBy
    ? [{ id: searchParams.sortBy, desc: searchParams.sortOrder === 'desc' }]
    : []

  const onSortingChange = useCallback(
    (updater: SortingState | ((old: SortingState) => SortingState)) => {
      const next = typeof updater === 'function' ? updater(sorting) : updater
      const sort = next[0]
      navigate({
        to: '/users',
        search: (prev) => ({
          ...prev,
          sortBy: sort?.id as ListUsersInput['sortBy'],
          sortOrder: sort ? (sort.desc ? 'desc' : 'asc') : undefined,
          page: 0,
        }),
      })
    },
    [navigate, sorting],
  )

  // Status filter
  const onStatusFilterChange = useCallback(
    (value: 'pending' | 'approved' | 'blocked' | undefined) => {
      navigate({
        to: '/users',
        search: (prev) => ({ ...prev, status: value, page: 0 }),
      })
    },
    [navigate],
  )

  // Mutations
  const [blockTarget, setBlockTarget] = useState<{ userId: string; email: string | null } | null>(null)
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: (mutationInput: { userId: string; status: 'approved' | 'blocked'; blockedReason?: string }) =>
      adminUpdateUserStatusFn({ data: mutationInput }),
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

  // Pending count for banner (only when not filtered)
  const pendingCount = !searchParams.status ? users.filter((u) => u.status === 'pending').length : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Users className="size-6" />
        <h1 className="text-2xl font-bold">Users</h1>
      </div>

      {pendingCount > 0 && (
        <button
          type="button"
          className="w-full rounded-lg border border-warning/20 bg-warning/5 px-4 py-3 text-left text-sm font-medium text-warning"
          onClick={() => navigate({ to: '/users', search: (prev) => ({ ...prev, status: 'pending', page: 0 }) })}
        >
          {pendingCount} user{pendingCount !== 1 ? 's' : ''} pending approval
        </button>
      )}

      <UsersDataTable
        data={users}
        totalCount={totalCount}
        pagination={pagination}
        sorting={sorting}
        onPaginationChange={onPaginationChange}
        onSortingChange={onSortingChange}
        search={searchValue}
        onSearchChange={setSearchValue}
        statusFilter={searchParams.status}
        onStatusFilterChange={onStatusFilterChange}
        meta={{
          onApprove: (userId) => mutation.mutate({ userId, status: 'approved' }),
          onBlock: (userId, email) => setBlockTarget({ userId, email }),
          onUnblock: (userId) => mutation.mutate({ userId, status: 'approved' }),
          isUpdating: updatingUserId,
        }}
        isLoading={isFetching}
      />

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
