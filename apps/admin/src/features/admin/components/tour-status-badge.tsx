import { Badge } from '@valguide/ui/components/badge'

const statusConfig = {
  draft: { label: 'Draft', className: 'bg-secondary text-secondary-foreground border-border' },
  published: { label: 'Published', className: 'bg-success/10 text-success border-success/20' },
  archived: { label: 'Archived', className: 'bg-muted text-muted-foreground border-border' },
} as const

export function TourStatusBadge({ status }: { status: 'draft' | 'published' | 'archived' }) {
  const config = statusConfig[status]
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  )
}
