import type { ColumnDef } from '@tanstack/react-table'
import { getAssetImageUrl } from '@valguide/core/features/assets/image-url'
import { Button } from '@valguide/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@valguide/ui/components/dropdown-menu'
import { Image } from '@valguide/ui/components/image'
import { ArrowUpDown, ImageOff, Loader2, MoreHorizontal } from 'lucide-react'
import type { AdminTourListItem } from '@/server/functions/list-tours.fn'
import { TourStatusBadge } from './tour-status-badge'

export type ToursTableMeta = {
  onBackfillTour: (tourNanoId: string) => void
  isBackfilling: string | null
}

export const toursColumns: ColumnDef<AdminTourListItem>[] = [
  {
    accessorKey: 'coverStoragePath',
    enableColumnFilter: false,
    header: 'Cover',
    cell: ({ row }) => {
      const storagePath = row.original.coverStoragePath
      return storagePath ? (
        <div className="size-10 overflow-hidden rounded bg-muted">
          <Image
            src={getAssetImageUrl({ storagePath })}
            alt=""
            layout="fullWidth"
            className="h-full w-full object-cover"
          />
        </div>
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
    accessorKey: 'slugs',
    enableColumnFilter: false,
    header: 'Slugs',
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5">
        {row.original.slugs.map((slug) => (
          <code key={slug} className="text-xs text-muted-foreground">
            {slug}
          </code>
        ))}
      </div>
    ),
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
  {
    id: 'actions',
    enableColumnFilter: false,
    cell: ({ row, table }) => {
      const tour = row.original
      const meta = table.options.meta as ToursTableMeta
      const isBackfilling = meta.isBackfilling === tour.nanoId

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
              <DropdownMenuItem onClick={() => meta.onBackfillTour(tour.nanoId)}>Backfill KV Cache</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]
