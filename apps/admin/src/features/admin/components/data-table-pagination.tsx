import type { Table } from '@tanstack/react-table'
import { Button } from '@valguide/ui/components/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@valguide/ui/components/select'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

type DataTablePaginationProps<TData> = {
  table: Table<TData>
  totalCount: number
  entityName: string
}

export function DataTablePagination<TData>({ table, totalCount, entityName }: DataTablePaginationProps<TData>) {
  const { pageIndex, pageSize } = table.getState().pagination
  const from = totalCount === 0 ? 0 : pageIndex * pageSize + 1
  const to = Math.min((pageIndex + 1) * pageSize, totalCount)

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        Showing {from}–{to} of {totalCount} {entityName}
      </p>
      <div className="flex items-center gap-2">
        <Select value={String(pageSize)} onValueChange={(value) => table.setPageSize(Number(value))}>
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
        <Button
          variant="outline"
          size="icon"
          className="size-8"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronsLeft className="size-4" />
          <span className="sr-only">First page</span>
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="size-8"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronLeft className="size-4" />
          <span className="sr-only">Previous page</span>
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="size-8"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          <ChevronRight className="size-4" />
          <span className="sr-only">Next page</span>
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="size-8"
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          <ChevronsRight className="size-4" />
          <span className="sr-only">Last page</span>
        </Button>
      </div>
    </div>
  )
}
