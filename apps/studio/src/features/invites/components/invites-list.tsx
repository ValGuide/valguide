import type { CurrentUserInvitation } from '@valguide/core/features/orgs/list-current-user-invitations.fn'
import { useTranslations } from '@valguide/core/i18n/client'
import { Badge } from '@valguide/ui/components/badge'
import { Button } from '@valguide/ui/components/button'
import { Card, CardContent } from '@valguide/ui/components/card'
import { Check, X } from 'lucide-react'

type InvitesListProps = {
  invitations: CurrentUserInvitation[]
  busyInvitationId?: string | null
  onAccept: (invitation: CurrentUserInvitation) => void
  onDecline: (invitation: CurrentUserInvitation) => void
}

export function InvitesList({ invitations, busyInvitationId, onAccept, onDecline }: InvitesListProps) {
  const t = useTranslations('invites')
  const roleLabels: Record<string, string> = {
    owner: t('roles.owner'),
    admin: t('roles.admin'),
    curator: t('roles.curator'),
    editor: t('roles.editor'),
    viewer: t('roles.viewer'),
  }

  if (invitations.length === 0) {
    return (
      <div className="flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <p className="text-sm font-medium">{t('emptyTitle')}</p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{t('emptyDescription')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {invitations.map((invitation) => {
        const isBusy = busyInvitationId === invitation.id

        return (
          <Card key={invitation.id} variant="outline">
            <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 space-y-2">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <h3 className="truncate text-sm font-semibold">{invitation.organizationName}</h3>
                  <Badge variant="secondary">{roleLabels[invitation.role] ?? invitation.role}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t('invitedBy', {
                    name: invitation.invitedBy.name || invitation.invitedBy.email || t('unknownInviter'),
                  })}
                </p>
              </div>
              <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                <Button variant="outline" onClick={() => onDecline(invitation)} disabled={isBusy}>
                  <X />
                  {t('decline')}
                </Button>
                <Button onClick={() => onAccept(invitation)} disabled={isBusy}>
                  <Check />
                  {t('accept')}
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
