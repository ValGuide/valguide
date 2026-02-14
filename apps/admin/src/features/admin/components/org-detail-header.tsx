import { Building2, Calendar, MapPin, Users } from 'lucide-react'
import type { AdminOrgDetail } from '@/server/functions/get-org-detail.fn'

type OrgDetailHeaderProps = {
  org: AdminOrgDetail
}

export function OrgDetailHeader({ org }: OrgDetailHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Building2 className="size-6" />
        <h1 className="text-2xl font-bold">{org.name}</h1>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <code className="rounded bg-muted px-2 py-0.5 text-xs">{org.nanoId}</code>

        <div className="flex items-center gap-1">
          <Users className="size-3.5" />
          <span>
            {org.memberCount} member{org.memberCount !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <MapPin className="size-3.5" />
          <span>
            {org.tourCount} tour{org.tourCount !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Calendar className="size-3.5" />
          <span>Created {new Date(org.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  )
}
