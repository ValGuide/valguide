import { useTranslations } from '@valguide/core/i18n/client'
import { Badge } from '@valguide/ui/components/badge'
import { Button } from '@valguide/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@valguide/ui/components/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@valguide/ui/components/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@valguide/ui/components/table'
import { Clock, Mail, MoreHorizontal, RefreshCw, X } from 'lucide-react'

export type OrgRole = 'owner' | 'admin' | 'curator' | 'editor' | 'viewer'

export interface PendingInvitation {
  id: string
  email: string
  role: OrgRole
  invitedBy: {
    name: string
    email: string
  }
  invitedAt: string
  expiresAt: string
}

export interface PendingInvitesListProps {
  invitations: PendingInvitation[]
  onResendInvite?: (invitationId: string) => void
  onCancelInvite?: (invitationId: string) => void
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

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'Expired'
  if (diffDays === 0) return 'Expires today'
  if (diffDays === 1) return 'Expires tomorrow'
  return `Expires in ${diffDays} days`
}

function isExpired(expiresAt: string): boolean {
  return new Date(expiresAt) < new Date()
}

export function PendingInvitesList({ invitations, onResendInvite, onCancelInvite }: PendingInvitesListProps) {
  const t = useTranslations('orgs.pendingInvites')

  const handleResend = (invitationId: string) => {
    if (onResendInvite) {
      onResendInvite(invitationId)
    }
  }

  const handleCancel = (invitationId: string) => {
    if (onCancelInvite) {
      onCancelInvite(invitationId)
    }
  }

  if (invitations.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="size-5" />
          {t('title')}
        </CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">{t('email')}</TableHead>
                  <TableHead>{t('role')}</TableHead>
                  <TableHead className="hidden md:table-cell">{t('invitedBy')}</TableHead>
                  <TableHead>{t('status')}</TableHead>
                  <TableHead className="w-[70px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((invitation) => {
                  const expired = isExpired(invitation.expiresAt)
                  return (
                    <TableRow key={invitation.id}>
                      <TableCell className="font-medium">{invitation.email}</TableCell>
                      <TableCell>
                        <Badge variant={roleVariants[invitation.role]}>{roleLabels[invitation.role]}</Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex flex-col">
                          <span className="text-sm">{invitation.invitedBy.name}</span>
                          <span className="text-xs text-muted-foreground">{invitation.invitedBy.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="size-3 text-muted-foreground" />
                          <span className={`text-sm ${expired ? 'text-destructive' : 'text-muted-foreground'}`}>
                            {formatRelativeTime(invitation.expiresAt)}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {t('sent')} {formatDate(invitation.invitedAt)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8">
                              <MoreHorizontal className="size-4" />
                              <span className="sr-only">{t('actions')}</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {onResendInvite && (
                              <DropdownMenuItem onClick={() => handleResend(invitation.id)}>
                                <RefreshCw className="mr-2 size-4" />
                                {t('resend')}
                              </DropdownMenuItem>
                            )}
                            {onCancelInvite && (
                              <DropdownMenuItem
                                onClick={() => handleCancel(invitation.id)}
                                className="text-destructive focus:text-destructive"
                              >
                                <X className="mr-2 size-4" />
                                {t('cancel')}
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
