import { Button } from '@valguide/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@valguide/ui/components/dialog'
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Block User</DialogTitle>
          <DialogDescription>
            Block {userEmail ?? 'this user'}? They will be signed out and unable to access the platform.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          placeholder="Reason for blocking (optional)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isBlocking}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isBlocking}>
            {isBlocking ? 'Blocking...' : 'Block User'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
