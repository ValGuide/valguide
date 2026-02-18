import { Button } from '@valguide/ui/components/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@valguide/ui/components/dialog'
import { Input } from '@valguide/ui/components/input'
import { Label } from '@valguide/ui/components/label'
import { useState } from 'react'
import { z } from 'zod'

type AddApprovedDomainDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  isAdding: boolean
  onConfirm: (domain: string) => void
}

const domainSchema = z.string().toLowerCase().trim().min(3, 'Domain must be at least 3 characters')

export function AddApprovedDomainDialog({ open, onOpenChange, isAdding, onConfirm }: AddApprovedDomainDialogProps) {
  const [domain, setDomain] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = () => {
    setError('')

    const domainValidation = domainSchema.safeParse(domain)
    if (!domainValidation.success) {
      setError(domainValidation.error.errors[0]?.message || 'Invalid domain')
      return
    }

    onConfirm(domainValidation.data)
    setDomain('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Approved Domain</DialogTitle>
          <DialogDescription>
            Users with email addresses from approved domains will be automatically approved on signup.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="domain">Domain</Label>
            <Input
              id="domain"
              placeholder="example.com"
              value={domain}
              onChange={(e) => {
                setDomain(e.target.value)
                setError('')
              }}
              disabled={isAdding}
              autoFocus
            />
            {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isAdding}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isAdding}>
            {isAdding ? 'Adding...' : 'Add Domain'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
