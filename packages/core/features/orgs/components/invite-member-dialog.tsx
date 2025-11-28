'use client'

import { Button } from '@valguide/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@valguide/ui/components/dialog'
import { Input } from '@valguide/ui/components/input'
import { Label } from '@valguide/ui/components/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@valguide/ui/components/select'
import { Crown, Edit3, Eye, Palette, Shield, UserPlus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import * as React from 'react'

export type OrgRole = 'owner' | 'admin' | 'curator' | 'editor' | 'viewer'

export interface InviteMemberDialogProps {
  currentUserRole: OrgRole
  onInvite?: (email: string, role: OrgRole) => Promise<void> | void
  children?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const roleIcons: Record<OrgRole, React.ElementType> = {
  owner: Crown,
  admin: Shield,
  curator: Palette,
  editor: Edit3,
  viewer: Eye,
}

const roleLabels: Record<OrgRole, string> = {
  owner: 'Owner',
  admin: 'Admin',
  curator: 'Curator',
  editor: 'Editor',
  viewer: 'Viewer',
}

const roleDescriptions: Record<OrgRole, string> = {
  owner: 'Full control including billing, team settings, and member management',
  admin: 'Manage members and content, access billing',
  curator: 'Full content control (create, edit, publish), cannot manage members',
  editor: 'Create and edit drafts, cannot publish or delete content',
  viewer: 'Read-only access to content and analytics',
}

const roleHierarchy: Record<OrgRole, number> = {
  viewer: 0,
  editor: 1,
  curator: 2,
  admin: 3,
  owner: 4,
}

function getAvailableRoles(currentUserRole: OrgRole): OrgRole[] {
  const currentLevel = roleHierarchy[currentUserRole]
  return (['viewer', 'editor', 'curator', 'admin', 'owner'] as OrgRole[]).filter(
    (role) => roleHierarchy[role] < currentLevel,
  )
}

export function InviteMemberDialog({
  currentUserRole,
  onInvite,
  children,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: InviteMemberDialogProps) {
  const t = useTranslations('orgs.inviteDialog')
  const [internalOpen, setInternalOpen] = React.useState(false)
  const [email, setEmail] = React.useState('')
  const [role, setRole] = React.useState<OrgRole>('editor')
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = isControlled ? (controlledOnOpenChange ?? (() => {})) : setInternalOpen

  const availableRoles = getAvailableRoles(currentUserRole)

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      // Reset form when closing
      setEmail('')
      setRole('editor')
      setError(null)
    }
  }

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!validateEmail(email)) {
      setError(t('invalidEmail'))
      return
    }

    if (!onInvite) return

    setIsSubmitting(true)
    try {
      await onInvite(email, role)
      handleOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('inviteError'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      {!children && (
        <DialogTrigger asChild>
          <Button>
            <UserPlus className="mr-2 size-4" />
            {t('inviteMember')}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-[95vw] sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="pr-8 text-left">{t('inviteMember')}</DialogTitle>
          <DialogDescription className="text-left">{t('inviteDescription')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email">{t('email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder="colleague@museum.ch"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">{t('role')}</Label>
              <Select value={role} onValueChange={(value) => setRole(value as OrgRole)} disabled={isSubmitting}>
                <SelectTrigger id="role" className="w-full [&_.role-description]:hidden">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-w-[calc(100vw-2rem)]">
                  {availableRoles.map((roleOption) => {
                    const Icon = roleIcons[roleOption]
                    return (
                      <SelectItem key={roleOption} value={roleOption}>
                        <div className="flex items-start gap-3">
                          <Icon className="mt-0.5 size-4 shrink-0" />
                          <div className="flex flex-col gap-0.5">
                            <span className="font-medium">{roleLabels[roleOption]}</span>
                            <span className="text-xs text-muted-foreground whitespace-normal text-left leading-snug role-description">
                              {roleDescriptions[roleOption]}
                            </span>
                          </div>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">{roleDescriptions[role]}</p>
            </div>
            {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isSubmitting}>
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting || !email}>
              {isSubmitting ? t('sending') : t('sendInvite')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
