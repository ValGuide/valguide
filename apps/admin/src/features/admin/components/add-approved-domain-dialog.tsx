import { Button } from '@valguide/ui/components/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@valguide/ui/components/dialog'
import { Input } from '@valguide/ui/components/input'
import { Label } from '@valguide/ui/components/label'
import { useState } from 'react'
import { z } from 'zod'

type AddApprovedDomainDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  organizations: Array<{ id: string; name: string }>
  isAdding: boolean
  onConfirm: (organizationId: string, domain: string) => void
}

const domainSchema = z.string().toLowerCase().trim().min(3, 'Domain must be at least 3 characters')

export function AddApprovedDomainDialog({
  open,
  onOpenChange,
  organizations,
  isAdding,
  onConfirm,
}: AddApprovedDomainDialogProps) {
  const [organizationId, setOrganizationId] = useState(organizations[0]?.id ?? '')
  const [domain, setDomain] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = () => {
    setError('')

    if (!organizationId) {
      setError('Please select an organization')
      return
    }

    const domainValidation = domainSchema.safeParse(domain)
    if (!domainValidation.success) {
      setError(domainValidation.error.errors[0]?.message || 'Invalid domain')
      return
    }

    onConfirm(organizationId, domainValidation.data)
    setDomain('')
    setOrganizationId(organizations[0]?.id ?? '')
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
            <Label htmlFor="org-select">Organization</Label>
            <select
              id="org-select"
              value={organizationId}
              onChange={(e) => setOrganizationId(e.target.value)}
              disabled={isAdding}
              className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
          </div>

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
