import type { AdminUserListItem } from '@valguide/core/features/admin/users/list-users.fn'
import { Button } from '@valguide/ui/components/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@valguide/ui/components/table'
import { UserStatusBadge } from './user-status-badge'

type UsersTableProps = {
  users: AdminUserListItem[]
  isUpdating: string | null
  onApprove: (userId: string) => void
  onBlock: (userId: string, email: string | null) => void
  onUnblock: (userId: string) => void
}

export function UsersTable({ users, isUpdating, onApprove, onBlock, onUnblock }: UsersTableProps) {
  if (users.length === 0) {
    return <div className="flex items-center justify-center py-12 text-muted-foreground">No users found</div>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Orgs</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">{user.email ?? '—'}</TableCell>
            <TableCell>
              {user.firstName || user.lastName ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() : '—'}
            </TableCell>
            <TableCell>
              <UserStatusBadge status={user.status} />
            </TableCell>
            <TableCell>{user.orgCount}</TableCell>
            <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
            <TableCell className="text-right">
              <UserActions
                user={user}
                isUpdating={isUpdating === user.id}
                onApprove={onApprove}
                onBlock={onBlock}
                onUnblock={onUnblock}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function UserActions({
  user,
  isUpdating,
  onApprove,
  onBlock,
  onUnblock,
}: {
  user: AdminUserListItem
  isUpdating: boolean
  onApprove: (userId: string) => void
  onBlock: (userId: string, email: string | null) => void
  onUnblock: (userId: string) => void
}) {
  if (user.status === 'pending') {
    return (
      <Button size="sm" onClick={() => onApprove(user.id)} disabled={isUpdating}>
        {isUpdating ? 'Approving...' : 'Approve'}
      </Button>
    )
  }

  if (user.status === 'blocked') {
    return (
      <Button size="sm" variant="outline" onClick={() => onUnblock(user.id)} disabled={isUpdating}>
        {isUpdating ? 'Unblocking...' : 'Unblock'}
      </Button>
    )
  }

  return (
    <Button size="sm" variant="outline" onClick={() => onBlock(user.id, user.email)} disabled={isUpdating}>
      Block
    </Button>
  )
}
