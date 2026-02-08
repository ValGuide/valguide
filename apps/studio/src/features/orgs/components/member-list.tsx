import type { OrgRole } from '@valguide/core/features/orgs/schema'
import { useTranslations } from '@valguide/core/i18n/client'
import type { TeamMember } from '@valguide/features/orgs/types.ts'
import { Badge } from '@valguide/ui/components/badge'
import { Button } from '@valguide/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@valguide/ui/components/dropdown-menu'
import { Crown, Edit3, Eye, MoreHorizontal, Palette, Shield, Trash2 } from 'lucide-react'
import type * as React from 'react'

export interface MemberListProps {
  members: TeamMember[]
  currentUserRole: OrgRole
  currentUserId?: string
  onChangeRole?: (memberId: string, newRole: OrgRole) => void
  onRemoveMember?: (memberId: string) => void
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

const roleVariants: Record<OrgRole, 'default' | 'secondary' | 'outline'> = {
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
  if (member.firstName && member.lastName) return `${member.firstName} ${member.lastName}`
  if (member.firstName) return member.firstName
  if (member.lastName) return member.lastName
  return member.email.split('@')[0] ?? ''
}

function canManageMember(currentUserRole: OrgRole, memberRole: OrgRole): boolean {
  if (roleHierarchy[currentUserRole] < roleHierarchy.admin) return false
  return roleHierarchy[currentUserRole] > roleHierarchy[memberRole]
}

export function MemberList({ members, currentUserRole, currentUserId, onChangeRole, onRemoveMember }: MemberListProps) {
  const t = useTranslations('orgs.members')

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">
        {t('title')} ({members.length})
      </h3>
      <div className="space-y-1">
        {members.map((member) => {
          const isCurrentUser = member.userId === currentUserId
          const canManage = canManageMember(currentUserRole, member.role) && !isCurrentUser
          const RoleIcon = roleIcons[member.role]

          return (
            <div key={member.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <RoleIcon className="size-4 shrink-0 text-muted-foreground" />
                <span className="text-sm font-medium truncate">
                  {getUserName(member)}
                  {isCurrentUser && <span className="text-muted-foreground font-normal"> ({t('you')})</span>}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant={roleVariants[member.role]} className="text-xs">
                  {roleLabels[member.role]}
                </Badge>
                {canManage ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-7">
                        <MoreHorizontal className="size-3.5" />
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
                                <DropdownMenuItem key={role} onClick={() => onChangeRole(member.id, role)}>
                                  <Icon className="mr-2 size-4" />
                                  {t('changeRoleTo', { role: roleLabels[role] })}
                                </DropdownMenuItem>
                              )
                            })}
                          <DropdownMenuSeparator />
                        </>
                      )}
                      {onRemoveMember && (
                        <DropdownMenuItem
                          onClick={() => onRemoveMember(member.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 size-4" />
                          {t('removeMember')}
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div className="w-7" />
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
