import type { CurrentUserInvitation } from '@valguide/core/features/orgs/list-current-user-invitations.fn'
import { useTranslations } from '@valguide/core/i18n/client'
import { Button } from '@valguide/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@valguide/ui/components/dialog'
import { InvitesList } from './invites-list'

type PendingInvitesDialogProps = {
  open: boolean
  invitations: CurrentUserInvitation[]
  busyInvitationId?: string | null
  onOpenChange: (open: boolean) => void
  onAccept: (invitation: CurrentUserInvitation) => void
  onDecline: (invitation: CurrentUserInvitation) => void
  onViewAll: () => void
}

export function PendingInvitesDialog({
  open,
  invitations,
  busyInvitationId,
  onOpenChange,
  onAccept,
  onDecline,
  onViewAll,
}: PendingInvitesDialogProps) {
  const t = useTranslations('invites')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{t('modalTitle')}</DialogTitle>
          <DialogDescription>{t('modalDescription')}</DialogDescription>
        </DialogHeader>
        <InvitesList
          invitations={invitations}
          busyInvitationId={busyInvitationId}
          onAccept={onAccept}
          onDecline={onDecline}
        />
        <DialogFooter>
          <Button variant="outline" onClick={onViewAll}>
            {t('viewAll')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
