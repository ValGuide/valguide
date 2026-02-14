import { Badge } from '@valguide/ui/components/badge'

const roleConfig = {
  owner: { label: 'Owner', className: 'bg-primary/10 text-primary border-primary/20' },
  admin: { label: 'Admin', className: 'bg-primary/10 text-primary border-primary/20' },
  curator: { label: 'Curator', className: 'bg-success/10 text-success border-success/20' },
  editor: { label: 'Editor', className: 'bg-warning/10 text-warning border-warning/20' },
  viewer: { label: 'Viewer', className: 'bg-muted-foreground/10 text-muted-foreground border-muted-foreground/20' },
} as const

export function RoleBadge({ role }: { role: string }) {
  const config = roleConfig[role as keyof typeof roleConfig] ?? {
    label: role,
    className: 'bg-muted text-muted-foreground',
  }

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  )
}
