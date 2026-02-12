import type { ColumnDef } from '@tanstack/react-table'
import type { AdminUserListItem } from '@valguide/core/features/admin/users/list-users.fn'
import { Button } from '@valguide/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@valguide/ui/components/dropdown-menu'
import { ArrowUpDown, MoreHorizontal } from 'lucide-react'
import { UserStatusBadge } from './user-status-badge'

export type UsersTableMeta = {
  onApprove: (userId: string) => void
  onBlock: (userId: string, email: string | null) => void
  onUnblock: (userId: string) => void
  isUpdating: string | null
}

export const usersColumns: ColumnDef<AdminUserListItem>[] = [
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Email
        <ArrowUpDown className="ml-2 size-4" />
      </Button>
    ),
    cell: ({ row }) => <span className="font-medium">{row.original.email ?? '—'}</span>,
  },
  {
    id: 'name',
    accessorFn: (row) => {
      const name = [row.firstName, row.lastName].filter(Boolean).join(' ')
      return name || '—'
    },
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Name
        <ArrowUpDown className="ml-2 size-4" />
      </Button>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <UserStatusBadge status={row.original.status} />,
  },
  {
    accessorKey: 'orgCount',
    header: ({ column }) => (
      <div className="text-right">
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Orgs
          <ArrowUpDown className="ml-2 size-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => <div className="text-right">{row.original.orgCount}</div>,
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Created
        <ArrowUpDown className="ml-2 size-4" />
      </Button>
    ),
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
  },
  {
    id: 'actions',
    cell: ({ row, table }) => {
      const user = row.original
      const meta = table.options.meta as UsersTableMeta
      const isUpdating = meta.isUpdating === user.id

      if (user.status === 'pending') {
        return (
          <div className="text-right">
            <Button size="sm" onClick={() => meta.onApprove(user.id)} disabled={isUpdating}>
              {isUpdating ? 'Approving...' : 'Approve'}
            </Button>
          </div>
        )
      }

      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8" disabled={isUpdating}>
                <MoreHorizontal className="size-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {user.status === 'approved' && (
                <DropdownMenuItem className="text-destructive" onClick={() => meta.onBlock(user.id, user.email)}>
                  Block
                </DropdownMenuItem>
              )}
              {user.status === 'blocked' && (
                <DropdownMenuItem onClick={() => meta.onUnblock(user.id)}>Unblock</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]
