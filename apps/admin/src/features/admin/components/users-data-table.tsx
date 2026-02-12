import {
  type Column,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  type OnChangeFn,
  type PaginationState,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table'
import type { AdminUserListItem } from '@valguide/core/features/admin/users/list-users.fn'
import { Button } from '@valguide/ui/components/button'
import { Input } from '@valguide/ui/components/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@valguide/ui/components/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@valguide/ui/components/table'
import { cn } from '@valguide/ui/lib/utils'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import type { UsersTableMeta } from './users-columns'
import { usersColumns } from './users-columns'

type UsersDataTableProps = {
  data: AdminUserListItem[]
  totalCount: number
  pagination: PaginationState
  sorting: SortingState
  columnFilters: ColumnFiltersState
  onPaginationChange: OnChangeFn<PaginationState>
  onSortingChange: OnChangeFn<SortingState>
  onColumnFiltersChange: OnChangeFn<ColumnFiltersState>
  meta: UsersTableMeta
  isLoading?: boolean
}

export function UsersDataTable({
  data,
  totalCount,
  pagination,
  sorting,
  columnFilters,
  onPaginationChange,
  onSortingChange,
  onColumnFiltersChange,
  meta,
  isLoading,
}: UsersDataTableProps) {
  const table = useReactTable({
    data,
    columns: usersColumns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    pageCount: Math.ceil(totalCount / pagination.pageSize),
    state: { pagination, sorting, columnFilters },
    onPaginationChange,
    onSortingChange,
    onColumnFiltersChange,
    meta,
  })

  const from = totalCount === 0 ? 0 : pagination.pageIndex * pagination.pageSize + 1
  const to = Math.min((pagination.pageIndex + 1) * pagination.pageSize, totalCount)

  return (
    <div className="space-y-4">
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
            <TableRow>
              {table.getHeaderGroups()[0]?.headers.map((header) => (
                <TableHead key={`filter-${header.id}`} className="py-1">
                  <ColumnFilter column={header.column} />
                </TableHead>
              ))}
            </TableRow>
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
                <TableCell colSpan={usersColumns.length} className="h-24 text-center">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <PaginationControls
        from={from}
        to={to}
        totalCount={totalCount}
        pageSize={pagination.pageSize}
        canPreviousPage={table.getCanPreviousPage()}
        canNextPage={table.getCanNextPage()}
        onFirst={() => table.setPageIndex(0)}
        onPrevious={() => table.previousPage()}
        onNext={() => table.nextPage()}
        onLast={() => table.setPageIndex(table.getPageCount() - 1)}
        onPageSizeChange={(size) => table.setPageSize(size)}
      />
    </div>
  )
}

function ColumnFilter<TData>({ column }: { column: Column<TData, unknown> }) {
  if (!column.getCanFilter()) return null

  const meta = column.columnDef.meta as
    | {
        filterType?: string
        filterOptions?: { label: string; value: string }[]
      }
    | undefined

  if (meta?.filterType === 'select' && meta.filterOptions) {
    return (
      <Select
        value={(column.getFilterValue() as string) ?? ''}
        onValueChange={(value) => column.setFilterValue(value === 'all' ? undefined : value)}
      >
        <SelectTrigger className="h-8 text-xs">
          <SelectValue placeholder="All" />
        </SelectTrigger>
        <SelectContent>
          {meta.filterOptions.map((option) => (
            <SelectItem key={option.value || 'all'} value={option.value || 'all'}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }

  return (
    <Input
      value={(column.getFilterValue() as string) ?? ''}
      onChange={(e) => column.setFilterValue(e.target.value || undefined)}
      placeholder="Filter..."
      className="h-8 text-xs"
    />
  )
}

function PaginationControls({
  from,
  to,
  totalCount,
  pageSize,
  canPreviousPage,
  canNextPage,
  onFirst,
  onPrevious,
  onNext,
  onLast,
  onPageSizeChange,
}: {
  from: number
  to: number
  totalCount: number
  pageSize: number
  canPreviousPage: boolean
  canNextPage: boolean
  onFirst: () => void
  onPrevious: () => void
  onNext: () => void
  onLast: () => void
  onPageSizeChange: (size: number) => void
}) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        Showing {from}–{to} of {totalCount} users
      </p>
      <div className="flex items-center gap-2">
        <Select value={String(pageSize)} onValueChange={(value) => onPageSizeChange(Number(value))}>
          <SelectTrigger className="w-[70px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
            <SelectItem value="200">200</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" className="size-8" onClick={onFirst} disabled={!canPreviousPage}>
          <ChevronsLeft className="size-4" />
          <span className="sr-only">First page</span>
        </Button>
        <Button variant="outline" size="icon" className="size-8" onClick={onPrevious} disabled={!canPreviousPage}>
          <ChevronLeft className="size-4" />
          <span className="sr-only">Previous page</span>
        </Button>
        <Button variant="outline" size="icon" className="size-8" onClick={onNext} disabled={!canNextPage}>
          <ChevronRight className="size-4" />
          <span className="sr-only">Next page</span>
        </Button>
        <Button variant="outline" size="icon" className="size-8" onClick={onLast} disabled={!canNextPage}>
          <ChevronsRight className="size-4" />
          <span className="sr-only">Last page</span>
        </Button>
      </div>
    </div>
  )
}
