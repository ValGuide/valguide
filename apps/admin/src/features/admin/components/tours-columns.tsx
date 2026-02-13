import type { ColumnDef } from '@tanstack/react-table'
import type { AdminTourListItem } from '@/server/functions/list-tours.fn'
import { getImageKitUrl } from '@valguide/core/features/assets/image-url'
import { Button } from '@valguide/ui/components/button'
import { ArrowUpDown, ImageOff } from 'lucide-react'
import { TourStatusBadge } from './tour-status-badge'

export const toursColumns: ColumnDef<AdminTourListItem>[] = [
  {
    accessorKey: 'coverStoragePath',
    enableColumnFilter: false,
    header: 'Cover',
    cell: ({ row }) => {
      const storagePath = row.original.coverStoragePath
      return storagePath ? (
        <img
          src={`${getImageKitUrl(storagePath)}?tr=w-64,h-40,fo-auto`}
          alt=""
          className="size-10 rounded object-cover"
        />
      ) : (
        <div className="flex size-10 items-center justify-center rounded bg-muted">
          <ImageOff className="size-4 text-muted-foreground" />
        </div>
      )
    },
  },
  {
    accessorKey: 'title',
    enableColumnFilter: true,
    meta: { filterType: 'text' },
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
    enableColumnFilter: false,
    header: 'ID',
    cell: ({ row }) => <code className="text-xs text-muted-foreground">{row.original.nanoId}</code>,
  },
  {
    accessorKey: 'organizationName',
    enableColumnFilter: true,
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
    enableColumnFilter: true,
    meta: {
      filterType: 'select',
      filterOptions: [
        { label: 'All', value: '' },
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
        { label: 'Archived', value: 'archived' },
      ],
    },
    header: 'Status',
    cell: ({ row }) => <TourStatusBadge status={row.original.status} />,
  },
  {
    accessorKey: 'availableLocales',
    enableColumnFilter: false,
    header: 'Locales',
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{row.original.availableLocales.join(', ')}</span>
    ),
  },
  {
    accessorKey: 'stopCount',
    enableColumnFilter: false,
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
    enableColumnFilter: false,
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
    enableColumnFilter: false,
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Published
        <ArrowUpDown className="ml-2 size-4" />
      </Button>
    ),
    cell: ({ row }) => (row.original.publishedAt ? new Date(row.original.publishedAt).toLocaleDateString() : '—'),
  },
]
