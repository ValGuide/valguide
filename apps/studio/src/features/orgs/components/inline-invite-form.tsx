import type { OrgRole } from '@valguide/core/features/orgs/schema'
import { useTranslations } from '@valguide/core/i18n/client'
import { Button } from '@valguide/ui/components/button'
import { Input } from '@valguide/ui/components/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@valguide/ui/components/select'
import { Crown, Edit3, Eye, Palette, Shield, UserPlus } from 'lucide-react'
import { useState } from 'react'

export interface InlineInviteFormProps {
  currentUserRole: OrgRole
  onInvite: (email: string, role: OrgRole) => Promise<void>
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

export function InlineInviteForm({ currentUserRole, onInvite }: InlineInviteFormProps) {
  const t = useTranslations('orgs.inviteDialog')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<OrgRole>('editor')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const availableRoles = getAvailableRoles(currentUserRole)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError(t('invalidEmail'))
      return
    }

    setIsSubmitting(true)
    try {
      await onInvite(email, role)
      setEmail('')
      setRole('editor')
    } catch (err) {
      setError(err instanceof Error ? err.message : t('inviteError'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium">
        <UserPlus className="size-4 text-muted-foreground" />
        {t('inviteMember')}
      </div>
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <Input
          type="email"
          placeholder="colleague@museum.ch"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isSubmitting}
          className="flex-1"
        />
        <Select value={role} onValueChange={(value) => setRole(value as OrgRole)} disabled={isSubmitting}>
          <SelectTrigger className="w-32 shrink-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availableRoles.map((roleOption) => {
              const Icon = roleIcons[roleOption]
              return (
                <SelectItem key={roleOption} value={roleOption}>
                  <div className="flex items-center gap-2">
                    <Icon className="size-3.5" />
                    <span>{roleLabels[roleOption]}</span>
                  </div>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
        <Button type="submit" size="sm" disabled={isSubmitting || !email}>
          {isSubmitting ? t('sending') : t('sendInvite')}
        </Button>
      </form>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <p className="text-xs text-muted-foreground">{t('inviteDescription')}</p>
    </div>
  )
}
