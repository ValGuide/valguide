import type { ColumnDef } from '@tanstack/react-table'
import type { AdminOrgListItem } from '@valguide/core/features/admin/orgs/list-orgs.fn'
import { Button } from '@valguide/ui/components/button'
import { ArrowUpDown } from 'lucide-react'

export const orgsColumns: ColumnDef<AdminOrgListItem>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Name
        <ArrowUpDown className="ml-2 size-4" />
      </Button>
    ),
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
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
]
