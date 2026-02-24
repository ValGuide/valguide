import { Link } from '@tanstack/react-router'
import type { ColumnDef } from '@tanstack/react-table'
import { Button } from '@valguide/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@valguide/ui/components/dropdown-menu'
import { ArrowUpDown, Loader2, MoreHorizontal } from 'lucide-react'
import type { AdminOrgListItem } from '@/server/functions/list-orgs.fn'

export type OrgsTableMeta = {
  onBackfillSlugs: (orgNanoId: string) => void
  isBackfilling: string | null
}

export const orgsColumns: ColumnDef<AdminOrgListItem>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Name
        <ArrowUpDown className="ml-2 size-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <Link
        to="/orgs/$nanoId"
        params={{ nanoId: row.original.nanoId }}
        className="font-medium text-primary hover:underline"
      >
        {row.original.name}
      </Link>
    ),
  },
  {
    accessorKey: 'nanoId',
    header: 'ID',
    cell: ({ row }) => <code className="text-xs text-muted-foreground">{row.original.nanoId}</code>,
  },
  {
    accessorKey: 'memberCount',
    header: ({ column }) => (
      <div className="text-right">
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Members
          <ArrowUpDown className="ml-2 size-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => <div className="text-right">{row.original.memberCount}</div>,
  },
  {
    accessorKey: 'tourCount',
    header: ({ column }) => (
      <div className="text-right">
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Tours
          <ArrowUpDown className="ml-2 size-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => <div className="text-right">{row.original.tourCount}</div>,
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Created
        <ArrowUpDown className="ml-2 size-4" />
      </Button>
    ),
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
  },
  {
    id: 'actions',
    cell: ({ row, table }) => {
      const org = row.original
      const meta = table.options.meta as OrgsTableMeta
      const isBackfilling = meta.isBackfilling === org.nanoId

      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8" disabled={isBackfilling}>
                {isBackfilling ? <Loader2 className="size-4 animate-spin" /> : <MoreHorizontal className="size-4" />}
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => meta.onBackfillSlugs(org.nanoId)}>Backfill KV Slugs</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]
