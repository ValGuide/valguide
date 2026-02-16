import {
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  type OnChangeFn,
  type PaginationState,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { Button } from '@valguide/ui/components/button'
import { Input } from '@valguide/ui/components/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@valguide/ui/components/table'
import { cn } from '@valguide/ui/lib/utils'
import { Search, X } from 'lucide-react'
import type { AdminTourListItem } from '@/server/functions/list-tours.fn'
import { DataTableFacetedFilter } from './data-table-faceted-filter'
import { DataTablePagination } from './data-table-pagination'
import { toursColumns } from './tours-columns'

const statusOptions = [
  { label: 'Draft', value: 'draft' },
  { label: 'Published', value: 'published' },
  { label: 'Archived', value: 'archived' },
]

type OrgOption = { label: string; value: string }

type ToursDataTableProps = {
  data: AdminTourListItem[]
  orgOptions: OrgOption[]
  totalCount: number
  pagination: PaginationState
  sorting: SortingState
  columnFilters: ColumnFiltersState
  onPaginationChange: OnChangeFn<PaginationState>
  onSortingChange: OnChangeFn<SortingState>
  onColumnFiltersChange: OnChangeFn<ColumnFiltersState>
  isLoading?: boolean
}

export function ToursDataTable({
  data,
  orgOptions,
  totalCount,
  pagination,
  sorting,
  columnFilters,
  onPaginationChange,
  onSortingChange,
  onColumnFiltersChange,
  isLoading,
}: ToursDataTableProps) {
  const table = useReactTable({
    data,
    columns: toursColumns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    pageCount: Math.ceil(totalCount / pagination.pageSize),
    state: { pagination, sorting, columnFilters },
    onPaginationChange,
    onSortingChange,
    onColumnFiltersChange,
  })

  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Filter tours..."
            value={(table.getColumn('title')?.getFilterValue() as string) ?? ''}
            onChange={(e) => table.getColumn('title')?.setFilterValue(e.target.value || undefined)}
            className="h-8 pl-9 w-[250px]"
          />
        </div>
        {table.getColumn('status') && (
          <DataTableFacetedFilter column={table.getColumn('status')} title="Status" options={statusOptions} />
        )}
        {table.getColumn('organizationName') && orgOptions.length > 0 && (
          <DataTableFacetedFilter
            column={table.getColumn('organizationName')}
            title="Organization"
            options={orgOptions}
            searchable
          />
        )}
        {isFiltered && (
          <Button variant="ghost" size="sm" className="h-8" onClick={() => table.resetColumnFilters()}>
            Reset
            <X className="size-4" />
          </Button>
        )}
      </div>

      <div className={cn('rounded-md border', isLoading && 'opacity-50 pointer-events-none transition-opacity')}>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={toursColumns.length} className="h-24 text-center">
                  No tours found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} totalCount={totalCount} entityName="tours" />
    </div>
  )
}
