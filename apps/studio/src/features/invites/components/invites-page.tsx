import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import type { CurrentUserInvitation } from '@valguide/core/features/orgs/list-current-user-invitations.fn'
import { useTranslations } from '@valguide/core/i18n/client'
import { toast } from '@valguide/core/ui/components/sonner/state'
import { PageTitle } from '@valguide/ui/components/page-title'
import { useState } from 'react'
import { useCurrentUserInvitations } from '../hooks/use-current-user-invitations'
import { acceptCurrentUserInvitation, declineCurrentUserInvitation } from './invites-actions'
import { InvitesList } from './invites-list'

export function InvitesPage() {
  const t = useTranslations('invites')
  const queryClient = useQueryClient()
  const router = useRouter()
  const { data: invitations = [], isLoading, error, refetch } = useCurrentUserInvitations()
  const [busyInvitationId, setBusyInvitationId] = useState<string | null>(null)

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
    } catch (actionError) {
      console.error(`Failed to ${action} invite:`, actionError)
      toast.error(action === 'accept' ? messages.acceptError : messages.declineError)
    } finally {
      setBusyInvitationId(null)
    }
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <div className="space-y-1">
          <PageTitle as="h2">{t('pageTitle')}</PageTitle>
          <p className="text-sm text-muted-foreground">{t('pageDescription')}</p>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <div className="h-24 rounded-lg bg-muted/50" />
            <div className="h-24 rounded-lg bg-muted/50" />
          </div>
        ) : error ? (
          <div className="rounded-lg border p-6">
            <p className="text-sm font-medium">{t('loadError')}</p>
            <button type="button" className="mt-2 text-sm underline" onClick={() => void refetch()}>
              {t('retry')}
            </button>
          </div>
        ) : (
          <InvitesList
            invitations={invitations}
            busyInvitationId={busyInvitationId}
            onAccept={(invitation) => void runAction(invitation, 'accept')}
            onDecline={(invitation) => void runAction(invitation, 'decline')}
          />
        )}
      </div>
    </main>
  )
}
