import { useMutation, useQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import type { ColumnFiltersState, PaginationState, SortingState } from '@tanstack/react-table'
import { toast } from '@valguide/ui/components/sonner/state'
import { BookOpen } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { z } from 'zod'
import { ToursDataTable } from '@/features/admin/components/tours-data-table'
import { adminOrgsQueryOptions } from '@/features/admin/orgs-query-options'
import { adminToursQueryOptions } from '@/features/admin/tours-query-options'
import { kvBackfillTourFn } from '@/server/functions/kv-backfill-tour.fn'
import type { ListToursInput } from '@/server/functions/list-tours.fn'

const toursSearchSchema = z.object({
  status: z.string().optional(),
  org: z.string().optional(),
  search: z.string().optional(),
  page: z.number().int().min(0).optional(),
  pageSize: z.number().int().min(1).max(200).optional(),
  sortBy: z.enum(['title', 'organizationName', 'stopCount', 'createdAt', 'publishedAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
})

function buildInput(search: z.infer<typeof toursSearchSchema>): ListToursInput {
  const statusValues = search.status?.split(',').filter(Boolean)
  const singleStatus = statusValues?.length === 1 ? statusValues[0] : undefined
  const orgValues = search.org?.split(',').filter(Boolean)
  return {
    page: search.page ?? 0,
    pageSize: search.pageSize ?? 20,
    search: search.search,
    status: singleStatus as ListToursInput['status'],
    organizationNames: orgValues?.length ? orgValues : undefined,
    sortBy: search.sortBy ?? 'createdAt',
    sortOrder: search.sortOrder ?? 'desc',
  }
}

export const Route = createFileRoute('/_main/tours')({
  validateSearch: toursSearchSchema,
  component: ToursPage,
})

function ToursPage() {
  const searchParams = Route.useSearch()
  const navigate = useNavigate()

  const input = buildInput(searchParams)
  const { data, isFetching } = useQuery(adminToursQueryOptions(input))
  const { data: orgsData } = useQuery(
    adminOrgsQueryOptions({ page: 0, pageSize: 200, sortBy: 'name', sortOrder: 'asc' }),
  )

  const tours = data?.tours ?? []
  const totalCount = data?.totalCount ?? 0

  const orgOptions = useMemo(
    () => (orgsData?.orgs ?? []).map((org) => ({ label: org.name, value: org.name })),
    [orgsData],
  )

  // Derive column filters from URL search params
  const statusValues = searchParams.status?.split(',').filter(Boolean)
  const orgValues = searchParams.org?.split(',').filter(Boolean)
  const columnFiltersFromUrl: ColumnFiltersState = [
    ...(searchParams.search ? [{ id: 'title', value: searchParams.search }] : []),
    ...(statusValues?.length ? [{ id: 'status', value: statusValues }] : []),
    ...(orgValues?.length ? [{ id: 'organizationName', value: orgValues }] : []),
  ]

  const [debouncedFilters, setDebouncedFilters] = useState<ColumnFiltersState>(columnFiltersFromUrl)

  // Sync when URL changes externally (e.g., browser back)
  useEffect(() => {
    setDebouncedFilters(columnFiltersFromUrl)
    // Only re-sync when the actual URL values change
  }, [searchParams.search, searchParams.status, searchParams.org])

  const onColumnFiltersChange = useCallback(
    (updater: ColumnFiltersState | ((old: ColumnFiltersState) => ColumnFiltersState)) => {
      const next = typeof updater === 'function' ? updater(debouncedFilters) : updater
      setDebouncedFilters(next)

      // Apply select filters (status, org) immediately — only debounce text filters
      const statusFilter = next.find((f) => f.id === 'status')?.value as string[] | undefined
      const statusParam = statusFilter?.length ? statusFilter.join(',') : undefined
      const orgFilter = next.find((f) => f.id === 'organizationName')?.value as string[] | undefined
      const orgParam = orgFilter?.length ? orgFilter.join(',') : undefined
      const currentStatus = searchParams.status ?? undefined
      const currentOrg = searchParams.org ?? undefined
      if (statusParam !== currentStatus || orgParam !== currentOrg) {
        const titleFilter = next.find((f) => f.id === 'title')?.value as string | undefined
        navigate({
          to: '/tours',
          search: {
            ...searchParams,
            search: titleFilter || undefined,
            status: statusParam,
            org: orgParam,
            page: 0,
          },
        })
      }
    },
    [debouncedFilters, searchParams, navigate],
  )

  // Debounce text filter (title/search) to URL
  useEffect(() => {
    const titleFilter = debouncedFilters.find((f) => f.id === 'title')?.value as string | undefined
    const currentSearch = searchParams.search ?? undefined

    if (titleFilter === currentSearch) return

    const timeout = setTimeout(() => {
      const statusFilter = debouncedFilters.find((f) => f.id === 'status')?.value as string[] | undefined
      const statusParam = statusFilter?.length ? statusFilter.join(',') : undefined
      const orgFilter = debouncedFilters.find((f) => f.id === 'organizationName')?.value as string[] | undefined
      const orgParam = orgFilter?.length ? orgFilter.join(',') : undefined
      navigate({
        to: '/tours',
        search: {
          ...searchParams,
          search: titleFilter || undefined,
          status: statusParam,
          org: orgParam,
          page: 0,
        },
      })
    }, 300)
    return () => clearTimeout(timeout)
  }, [debouncedFilters, searchParams.search, navigate])

  // Pagination state
  const pagination: PaginationState = {
    pageIndex: searchParams.page ?? 0,
    pageSize: searchParams.pageSize ?? 20,
  }

  const onPaginationChange = useCallback(
    (updater: PaginationState | ((old: PaginationState) => PaginationState)) => {
      const next = typeof updater === 'function' ? updater(pagination) : updater
      navigate({
        to: '/tours',
        search: {
          ...searchParams,
          page: next.pageIndex,
          pageSize: next.pageSize,
        },
      })
    },
    [navigate, pagination],
  )

  // Sorting state
  const sorting: SortingState = searchParams.sortBy
    ? [{ id: searchParams.sortBy, desc: searchParams.sortOrder === 'desc' }]
    : []

  const onSortingChange = useCallback(
    (updater: SortingState | ((old: SortingState) => SortingState)) => {
      const next = typeof updater === 'function' ? updater(sorting) : updater
      const sort = next[0]
      navigate({
        to: '/tours',
        search: {
          ...searchParams,
          sortBy: sort?.id as ListToursInput['sortBy'],
          sortOrder: sort ? (sort.desc ? 'desc' : 'asc') : undefined,
          page: 0,
        },
      })
    },
    [navigate, sorting],
  )

  // Backfill KV cache for a specific tour
  const [backfillingTourId, setBackfillingTourId] = useState<string | null>(null)

  const backfillTourMutation = useMutation({
    retry: false,
    mutationFn: (tourNanoId: string) => kvBackfillTourFn({ data: { tourNanoId } }),
    onMutate: (tourNanoId) => setBackfillingTourId(tourNanoId),
    onSuccess: (result) => {
      const msg = `${result.localesWritten} locales, ${result.slugsWritten} slugs written`
      if (result.errors.length > 0) {
        toast.warning(`${msg} — ${result.errors.length} errors (see console)`)
        console.error('Backfill errors:', result.errors)
      } else {
        toast.success(msg)
      }
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Backfill failed'),
    onSettled: () => setBackfillingTourId(null),
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BookOpen className="size-6" />
        <h1 className="text-2xl font-bold">Tours</h1>
      </div>

      <ToursDataTable
        data={tours}
        orgOptions={orgOptions}
        totalCount={totalCount}
        pagination={pagination}
        sorting={sorting}
        columnFilters={debouncedFilters}
        onPaginationChange={onPaginationChange}
        onSortingChange={onSortingChange}
        onColumnFiltersChange={onColumnFiltersChange}
        isLoading={isFetching}
        onBackfillTour={(nanoId) => backfillTourMutation.mutate(nanoId)}
        isBackfilling={backfillingTourId}
      />
    </div>
  )
}
