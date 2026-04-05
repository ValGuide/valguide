import { useTranslations } from '@valguide/core/i18n/client'
import type { TeamMember } from '@valguide/features/orgs/types.ts'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@valguide/ui/components/alert-dialog'

interface RemoveMemberDialogProps {
  member: TeamMember | null
  open: boolean
  isRemoving: boolean
  onConfirm: () => void
  onOpenChange: (open: boolean) => void
}

function getMemberLabel(member: TeamMember | null): string {
  if (!member) {
    return ''
  }

  const fullName = [member.firstName, member.lastName].filter(Boolean).join(' ').trim()
  return fullName || member.email
}

export function RemoveMemberDialog({ member, open, isRemoving, onConfirm, onOpenChange }: RemoveMemberDialogProps) {
  const t = useTranslations('orgs.members')

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('removeDialogTitle')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('removeDialogDescription', { member: getMemberLabel(member) })}
            <span className="mt-2 block">{t('removeDialogWarning')}</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isRemoving}>{t('removeDialogCancel')}</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirm} disabled={isRemoving || !member}>
            {isRemoving ? t('removeDialogRemoving') : t('removeDialogConfirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
