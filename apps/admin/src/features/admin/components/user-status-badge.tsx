import { Badge } from '@valguide/ui/components/badge'

const statusConfig = {
  pending: { label: 'Pending', className: 'bg-warning/10 text-warning border-warning/20' },
  approved: { label: 'Approved', className: 'bg-success/10 text-success border-success/20' },
  blocked: { label: 'Blocked', className: 'bg-destructive/10 text-destructive border-destructive/20' },
  deactivated: { label: 'Deactivated', className: 'bg-muted text-muted-foreground border-border' },
} as const

export function UserStatusBadge({ status }: { status: 'pending' | 'approved' | 'blocked' | 'deactivated' }) {
  const config = statusConfig[status]
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  )
}
