import { Button } from '@valguide/ui/components/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@valguide/ui/components/table'
import { Trash2 } from 'lucide-react'
import type { ApprovedDomain } from '@/server/functions/get-approved-domains.fn'

type ApprovedDomainsTableProps = {
  domains: ApprovedDomain[]
  isDeletingId: string | null
  onDelete: (domainId: string) => void
}

export function ApprovedDomainsTable({ domains, isDeletingId, onDelete }: ApprovedDomainsTableProps) {
  if (domains.length === 0) {
    return <div className="flex items-center justify-center py-12 text-muted-foreground">No approved domains yet</div>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Domain</TableHead>
          <TableHead>Organization ID</TableHead>
          <TableHead>Added</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {domains.map((domain) => (
          <TableRow key={domain.id}>
            <TableCell className="font-mono font-medium">{domain.domain}</TableCell>
            <TableCell className="font-mono text-sm text-muted-foreground">
              {domain.organizationId.slice(0, 8)}…
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {new Date(domain.createdAt).toLocaleDateString()}
            </TableCell>
            <TableCell className="text-right">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete(domain.id)}
                disabled={isDeletingId === domain.id}
              >
                <Trash2 className="size-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
