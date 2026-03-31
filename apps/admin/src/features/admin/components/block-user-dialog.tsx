import { Button } from '@valguide/ui/components/button'
import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from '@valguide/ui/components/responsive-dialog'
import { Textarea } from '@valguide/ui/components/textarea'
import { useState } from 'react'

type BlockUserDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  userEmail: string | null
  isBlocking: boolean
  onConfirm: (reason: string) => void
}

export function BlockUserDialog({ open, onOpenChange, userEmail, isBlocking, onConfirm }: BlockUserDialogProps) {
  const [reason, setReason] = useState('')

  const handleConfirm = () => {
    onConfirm(reason)
    setReason('')
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setReason('')
    }
    onOpenChange(nextOpen)
  }

  return (
    <ResponsiveDialog open={open} onOpenChange={handleOpenChange} mobileVariant="sheet">
      <ResponsiveDialogContent className="flex min-h-0 flex-col sm:max-w-md">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Block User</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            Block {userEmail ?? 'this user'}? They will be signed out and unable to access the platform.
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        <ResponsiveDialogBody>
          <Textarea
            placeholder="Reason for blocking (optional)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={6}
            className="min-h-40 resize-none"
          />
        </ResponsiveDialogBody>
        <ResponsiveDialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isBlocking}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isBlocking}>
            {isBlocking ? 'Blocking...' : 'Block User'}
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  )
}
