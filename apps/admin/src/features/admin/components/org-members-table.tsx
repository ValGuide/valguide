import { Button } from '@valguide/ui/components/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@valguide/ui/components/table'
import { Trash2 } from 'lucide-react'
import type { AdminOrgMember } from '@/server/functions/get-org-members.fn'
import { ChangeRoleSelect } from './change-role-select'

type OrgMembersTableProps = {
  members: AdminOrgMember[]
  onRoleChange: (memberId: string, role: string) => void
  onRemove: (memberId: string, email: string | null) => void
  updatingMemberId: string | null
}

export function OrgMembersTable({ members, onRoleChange, onRemove, updatingMemberId }: OrgMembersTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="w-[100px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.length > 0 ? (
            members.map((member) => {
              const isUpdating = updatingMemberId === member.memberId
              const name = [member.firstName, member.lastName].filter(Boolean).join(' ') || '—'

              return (
                <TableRow key={member.memberId} className={isUpdating ? 'opacity-50' : undefined}>
                  <TableCell className="font-medium">{member.email ?? '—'}</TableCell>
                  <TableCell>{name}</TableCell>
                  <TableCell>
                    <ChangeRoleSelect
                      currentRole={member.role}
                      onRoleChange={(role) => onRoleChange(member.memberId, role)}
                      disabled={isUpdating}
                    />
                  </TableCell>
                  <TableCell>{new Date(member.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-destructive hover:text-destructive"
                      onClick={() => onRemove(member.memberId, member.email)}
                      disabled={isUpdating}
                    >
                      <Trash2 className="size-4" />
                      <span className="sr-only">Remove member</span>
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No members found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
