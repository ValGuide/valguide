import type { ColumnDef } from '@tanstack/react-table'
import type { AdminTourListItem } from '@valguide/core/features/admin/tours/list-tours.fn'
import { Button } from '@valguide/ui/components/button'
import { ArrowUpDown } from 'lucide-react'
import { TourStatusBadge } from './tour-status-badge'

export const toursColumns: ColumnDef<AdminTourListItem>[] = [
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Title
        <ArrowUpDown className="ml-2 size-4" />
      </Button>
    ),
    cell: ({ row }) =>
      row.original.title ? (
        <span className="font-medium">{row.original.title}</span>
      ) : (
        <span className="font-medium text-muted-foreground">Untitled</span>
      ),
  },
  {
    accessorKey: 'nanoId',
    header: 'ID',
    cell: ({ row }) => <code className="text-xs text-muted-foreground">{row.original.nanoId}</code>,
  },
  {
    accessorKey: 'organizationName',
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Organization
        <ArrowUpDown className="ml-2 size-4" />
      </Button>
    ),
    cell: ({ row }) => row.original.organizationName,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <TourStatusBadge status={row.original.status} />,
  },
  {
    accessorKey: 'availableLocales',
    header: 'Locales',
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{row.original.availableLocales.join(', ')}</span>
    ),
  },
  {
    accessorKey: 'stopCount',
    header: ({ column }) => (
      <div className="text-right">
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Stops
          <ArrowUpDown className="ml-2 size-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => <div className="text-right">{row.original.stopCount}</div>,
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
    accessorKey: 'publishedAt',
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Published
        <ArrowUpDown className="ml-2 size-4" />
      </Button>
    ),
    cell: ({ row }) => (row.original.publishedAt ? new Date(row.original.publishedAt).toLocaleDateString() : '—'),
  },
]
