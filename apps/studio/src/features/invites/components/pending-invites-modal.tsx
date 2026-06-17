import { useQueryClient } from '@tanstack/react-query'
import { Link, useLocation, useRouter } from '@tanstack/react-router'
import type { CurrentUserInvitation } from '@valguide/core/features/orgs/list-current-user-invitations.fn'
import { useTranslations } from '@valguide/core/i18n/client'
import { unlocalizedPathname } from '@valguide/core/i18n/route.utils'
import { toast } from '@valguide/core/ui/components/sonner/state'
import { Button } from '@valguide/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@valguide/ui/components/dialog'
import { useEffect, useMemo, useState } from 'react'
import { useCurrentUserInvitations } from '../hooks/use-current-user-invitations'
import { acceptCurrentUserInvitation, declineCurrentUserInvitation } from './invites-actions'
import { InvitesList } from './invites-list'

export function PendingInvitesModal() {
  const t = useTranslations('invites')
  const queryClient = useQueryClient()
  const router = useRouter()
  const location = useLocation()
  const { data: invitations = [] } = useCurrentUserInvitations()
  const [open, setOpen] = useState(false)
  const [dismissedSignature, setDismissedSignature] = useState<string | null>(null)
  const [busyInvitationId, setBusyInvitationId] = useState<string | null>(null)

  const signature = useMemo(() => invitations.map((invite) => invite.id).join(':'), [invitations])
  const isInvitesPage = unlocalizedPathname(location.pathname) === '/invites'

  useEffect(() => {
    if (!isInvitesPage && invitations.length > 0 && signature !== dismissedSignature) {
      setOpen(true)
    }
  }, [dismissedSignature, invitations.length, isInvitesPage, signature])

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen && signature) {
      setDismissedSignature(signature)
    }
  }

  const messages = {
    acceptSuccess: (teamName: string) => t('acceptSuccess', { teamName }),
    acceptError: t('acceptError'),
    declineSuccess: t('declineSuccess'),
    declineError: t('declineError'),
    switchWorkspace: t('switchWorkspace'),
    switchError: t('switchError'),
  }

  const runAction = async (invitation: CurrentUserInvitation, action: 'accept' | 'decline') => {
    setBusyInvitationId(invitation.id)
    try {
      if (action === 'accept') {
        await acceptCurrentUserInvitation({ invitation, queryClient, router, messages })
      } else {
        await declineCurrentUserInvitation({ invitation, queryClient, messages })
      }
    } catch (error) {
      console.error(`Failed to ${action} invite:`, error)
      const errorMessage = action === 'accept' ? messages.acceptError : messages.declineError
      toast.error(errorMessage)
    } finally {
      setBusyInvitationId(null)
    }
  }

  if (invitations.length === 0) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{t('modalTitle')}</DialogTitle>
          <DialogDescription>{t('modalDescription')}</DialogDescription>
        </DialogHeader>
        <InvitesList
          invitations={invitations}
          busyInvitationId={busyInvitationId}
          onAccept={(invitation) => void runAction(invitation, 'accept')}
          onDecline={(invitation) => void runAction(invitation, 'decline')}
        />
        <DialogFooter>
          <Button variant="outline" asChild>
            <Link to="/invites" onClick={() => handleOpenChange(false)}>
              {t('viewAll')}
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
