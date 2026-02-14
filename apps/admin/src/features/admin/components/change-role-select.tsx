import { ORG_ROLES } from '@valguide/core/features/orgs/schema'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@valguide/ui/components/select'

type ChangeRoleSelectProps = {
  currentRole: string
  onRoleChange: (role: string) => void
  disabled?: boolean
}

export function ChangeRoleSelect({ currentRole, onRoleChange, disabled }: ChangeRoleSelectProps) {
  return (
    <Select value={currentRole} onValueChange={onRoleChange} disabled={disabled}>
      <SelectTrigger className="h-8 w-[120px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ORG_ROLES.map((role) => (
          <SelectItem key={role} value={role}>
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
