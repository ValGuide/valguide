import {
  flexRender,
  getCoreRowModel,
  type OnChangeFn,
  type PaginationState,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { Input } from '@valguide/ui/components/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@valguide/ui/components/table'
import { cn } from '@valguide/ui/lib/utils'
import { Search } from 'lucide-react'
import type { AdminOrgListItem } from '@/server/functions/list-orgs.fn'
import { DataTablePagination } from './data-table-pagination'
import { orgsColumns } from './orgs-columns'

type OrgsDataTableProps = {
  data: AdminOrgListItem[]
  totalCount: number
  pagination: PaginationState
  sorting: SortingState
  onPaginationChange: OnChangeFn<PaginationState>
  onSortingChange: OnChangeFn<SortingState>
  search: string
  onSearchChange: (value: string) => void
  isLoading?: boolean
}

export function OrgsDataTable({
  data,
  totalCount,
  pagination,
  sorting,
  onPaginationChange,
  onSortingChange,
  search,
  onSearchChange,
  isLoading,
}: OrgsDataTableProps) {
  const table = useReactTable({
    data,
    columns: orgsColumns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    pageCount: Math.ceil(totalCount / pagination.pageSize),
    state: { pagination, sorting },
    onPaginationChange,
    onSortingChange,
  })

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-8 pl-9 w-[250px]"
        />
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
                <TableCell colSpan={orgsColumns.length} className="h-24 text-center">
                  No organizations found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} totalCount={totalCount} entityName="organizations" />
    </div>
  )
}
