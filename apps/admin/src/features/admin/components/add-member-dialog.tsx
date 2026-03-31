import { ORG_ROLES } from '@valguide/core/features/orgs/schema'
import { Button } from '@valguide/ui/components/button'
import { Input } from '@valguide/ui/components/input'
import { Label } from '@valguide/ui/components/label'
import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from '@valguide/ui/components/responsive-dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@valguide/ui/components/select'
import { useState } from 'react'

type AddMemberDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  isAdding: boolean
  onConfirm: (email: string, role: string) => void
}

export function AddMemberDialog({ open, onOpenChange, isAdding, onConfirm }: AddMemberDialogProps) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('editor')

  const handleConfirm = () => {
    if (!email.trim()) return
    onConfirm(email.trim(), role)
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setEmail('')
      setRole('editor')
    }
    onOpenChange(nextOpen)
  }

  return (
    <ResponsiveDialog open={open} onOpenChange={handleOpenChange} mobileVariant="sheet">
      <ResponsiveDialogContent className="flex min-h-0 flex-col sm:max-w-md">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Add Member</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            Add an existing user to this organization by email address.
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <ResponsiveDialogBody className="py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="member-email">Email</Label>
              <Input
                id="member-email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleConfirm()
                }}
              />
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ORG_ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </ResponsiveDialogBody>

        <ResponsiveDialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isAdding}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isAdding || !email.trim()}>
            {isAdding ? 'Adding...' : 'Add Member'}
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  )
}
