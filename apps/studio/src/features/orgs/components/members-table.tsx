import type { OrgRole } from '@valguide/core/features/orgs/schema'
import { useTranslations } from '@valguide/core/i18n/client'
import type { TeamMember } from '@valguide/features/orgs/types.ts'
import { Avatar, AvatarFallback, AvatarImage } from '@valguide/ui/components/avatar'
import { Badge } from '@valguide/ui/components/badge'
import { Button } from '@valguide/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@valguide/ui/components/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@valguide/ui/components/table'
import { Crown, Edit3, Eye, Mail, MoreHorizontal, Palette, Shield, Trash2 } from 'lucide-react'
import type * as React from 'react'

export type { OrgRole }

export interface MembersTableProps {
  members: TeamMember[]
  currentUserRole: OrgRole
  currentUserId?: string
  onChangeRole?: (memberId: string, newRole: OrgRole) => void
  onRemoveMember?: (memberId: string) => void
  onResendInvite?: (memberId: string) => void
}

const roleIcons: Record<OrgRole, React.ElementType> = {
  owner: Crown,
  admin: Shield,
  curator: Palette,
  editor: Edit3,
  viewer: Eye,
}

const roleLabels: Record<OrgRole, string> = {
  owner: 'Owner',
  admin: 'Admin',
  curator: 'Curator',
  editor: 'Editor',
  viewer: 'Viewer',
}

const roleVariants: Record<OrgRole, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  owner: 'default',
  admin: 'secondary',
  curator: 'secondary',
  editor: 'outline',
  viewer: 'outline',
}

const roleHierarchy: Record<OrgRole, number> = {
  viewer: 0,
  editor: 1,
  curator: 2,
  admin: 3,
  owner: 4,
}

function getUserName(member: TeamMember): string {
  if (member.firstName && member.lastName) {
    return `${member.firstName} ${member.lastName}`
  }
  if (member.firstName) return member.firstName
  if (member.lastName) return member.lastName
  return member.email.split('@')[0] || ''
}

function getUserInitials(member: TeamMember): string {
  if (member.firstName && member.lastName) {
    return `${member.firstName[0]}${member.lastName[0]}`.toUpperCase()
  }
  const name = getUserName(member)
  return name.slice(0, 2).toUpperCase()
}

function canManageMember(currentUserRole: OrgRole, memberRole: OrgRole): boolean {
  // Only admin and owner can manage members
  if (roleHierarchy[currentUserRole] < roleHierarchy.admin) return false

  // Can't manage someone with equal or higher role
  return roleHierarchy[currentUserRole] > roleHierarchy[memberRole]
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

export function MembersTable({
  members,
  currentUserRole,
  currentUserId,
  onChangeRole,
  onRemoveMember,
  onResendInvite,
}: MembersTableProps) {
  const t = useTranslations('orgs.members')

  const handleChangeRole = (memberId: string, newRole: OrgRole) => {
    if (onChangeRole) {
      onChangeRole(memberId, newRole)
    }
  }

  const handleRemoveMember = (memberId: string) => {
    if (onRemoveMember) {
      onRemoveMember(memberId)
    }
  }

  const handleResendInvite = (memberId: string) => {
    if (onResendInvite) {
      onResendInvite(memberId)
    }
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-50">{t('member')}</TableHead>
              <TableHead>{t('role')}</TableHead>
              <TableHead className="hidden md:table-cell">{t('joined')}</TableHead>
              <TableHead className="w-17.5" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  {t('noMembers')}
                </TableCell>
              </TableRow>
            ) : (
              members.map((member) => {
                const isCurrentUser = member.userId === currentUserId
                const canManage = canManageMember(currentUserRole, member.role) && !isCurrentUser
                const RoleIcon = roleIcons[member.role]

                return (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-10">
                          {member.avatar && <AvatarImage src={member.avatar} alt={getUserName(member)} />}
                          <AvatarFallback>{getUserInitials(member)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{getUserName(member)}</span>
                            {isCurrentUser && (
                              <Badge variant="outline" className="text-xs">
                                {t('you')}
                              </Badge>
                            )}
                          </div>
                          <span className="text-sm text-muted-foreground">{member.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={roleVariants[member.role]} className="gap-1.5">
                        <RoleIcon className="size-3" />
                        {roleLabels[member.role]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground hidden md:table-cell">
                      {formatDate(member.joinedAt)}
                    </TableCell>
                    <TableCell>
                      {canManage && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8">
                              <MoreHorizontal className="size-4" />
                              <span className="sr-only">{t('actions')}</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {onChangeRole && (
                              <>
                                {(['owner', 'admin', 'curator', 'editor', 'viewer'] as OrgRole[])
                                  .filter((role) => role !== member.role)
                                  .filter((role) => roleHierarchy[role] < roleHierarchy[currentUserRole])
                                  .map((role) => {
                                    const Icon = roleIcons[role]
                                    return (
                                      <DropdownMenuItem key={role} onClick={() => handleChangeRole(member.id, role)}>
                                        <Icon className="mr-2 size-4" />
                                        {t('changeRoleTo', { role: roleLabels[role] })}
                                      </DropdownMenuItem>
                                    )
                                  })}
                                <DropdownMenuSeparator />
                              </>
                            )}
                            {onResendInvite && (
                              <DropdownMenuItem onClick={() => handleResendInvite(member.id)}>
                                <Mail className="mr-2 size-4" />
                                {t('resendInvite')}
                              </DropdownMenuItem>
                            )}
                            {onRemoveMember && (
                              <DropdownMenuItem
                                onClick={() => handleRemoveMember(member.id)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 size-4" />
                                {t('removeMember')}
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
