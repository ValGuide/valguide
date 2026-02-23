import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import type { PaginationState, SortingState } from '@tanstack/react-table'
import { Button } from '@valguide/ui/components/button'
import { toast } from '@valguide/ui/components/sonner/state'
import { Building2, Plus } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { z } from 'zod'
import { CreateOrgDialog, type CreateOrgInput } from '@/features/admin/components/create-org-dialog'
import { OrgsDataTable } from '@/features/admin/components/orgs-data-table'
import { adminOrgsQueryOptions } from '@/features/admin/orgs-query-options'
import { adminCreateOrgFn } from '@/server/functions/admin-create-org.fn'
import { adminUploadOrgLogoFn } from '@/server/functions/admin-upload-org-logo.fn'
import type { ListOrgsInput } from '@/server/functions/list-orgs.fn'

const orgsSearchSchema = z.object({
  search: z.string().optional(),
  page: z.number().int().min(0).optional(),
  pageSize: z.number().int().min(1).max(200).optional(),
  sortBy: z.enum(['name', 'memberCount', 'tourCount', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
})

function buildInput(search: z.infer<typeof orgsSearchSchema>): ListOrgsInput {
  return {
    page: search.page ?? 0,
    pageSize: search.pageSize ?? 20,
    search: search.search,
    sortBy: search.sortBy ?? 'createdAt',
    sortOrder: search.sortOrder ?? 'desc',
  }
}

export const Route = createFileRoute('/_main/orgs')({
  validateSearch: orgsSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) => {
    context.queryClient.ensureQueryData(adminOrgsQueryOptions(buildInput(deps)))
  },
  component: OrgsPage,
})

function OrgsPage() {
  const searchParams = Route.useSearch()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const input = buildInput(searchParams)
  const { data, isFetching } = useQuery(adminOrgsQueryOptions(input))

  const orgs = data?.orgs ?? []
  const totalCount = data?.totalCount ?? 0

  // Debounced search
  const [searchValue, setSearchValue] = useState(searchParams.search ?? '')

  // Sync search input when URL changes externally (e.g., browser back)
  useEffect(() => {
    setSearchValue(searchParams.search ?? '')
  }, [searchParams.search])

  useEffect(() => {
    const timeout = setTimeout(() => {
      const current = searchParams.search ?? ''
      if (searchValue !== current) {
        navigate({
          to: '/orgs',
          search: { ...searchParams, search: searchValue || undefined, page: 0 },
        })
      }
    }, 300)
    return () => clearTimeout(timeout)
  }, [searchValue, searchParams.search, navigate])

  // Pagination state
  const pagination: PaginationState = {
    pageIndex: searchParams.page ?? 0,
    pageSize: searchParams.pageSize ?? 20,
  }

  const onPaginationChange = useCallback(
    (updater: PaginationState | ((old: PaginationState) => PaginationState)) => {
      const next = typeof updater === 'function' ? updater(pagination) : updater
      navigate({
        to: '/orgs',
        search: { ...searchParams, page: next.pageIndex, pageSize: next.pageSize },
      })
    },
    [navigate, pagination, searchParams],
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
        to: '/orgs',
        search: {
          ...searchParams,
          sortBy: sort?.id as ListOrgsInput['sortBy'],
          sortOrder: sort ? (sort.desc ? 'desc' : 'asc') : undefined,
          page: 0,
        },
      })
    },
    [navigate, sorting, searchParams],
  )

  // Create org
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const createMutation = useMutation({
    mutationFn: async (input: CreateOrgInput) => {
      const result = await adminCreateOrgFn({ data: input })
      if (result.success && result.org && input.logo) {
        const logoResult = await adminUploadOrgLogoFn({
          data: { orgNanoId: result.org.nanoId, base64: input.logo.base64, mimeType: input.logo.mimeType },
        })
        if (!logoResult.success) {
          toast.warning('Organization created but logo upload failed')
        }
      }
      return result
    },
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.error ?? 'Failed to create organization')
        return
      }
      queryClient.invalidateQueries({ queryKey: ['admin', 'orgs'] })
      toast.success(`Organization "${result.org!.name}" created`)
      if (result.memberErrors?.length) {
        for (const err of result.memberErrors) {
          toast.warning(err)
        }
      }
      setShowCreateDialog(false)
      navigate({ to: '/orgs/$nanoId', params: { nanoId: result.org!.nanoId } })
    },
    onError: () => {
      toast.error('Failed to create organization')
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building2 className="size-6" />
          <h1 className="text-2xl font-bold">Organizations</h1>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 size-4" />
          Create Organization
        </Button>
      </div>

      <OrgsDataTable
        data={orgs}
        totalCount={totalCount}
        pagination={pagination}
        sorting={sorting}
        onPaginationChange={onPaginationChange}
        onSortingChange={onSortingChange}
        search={searchValue}
        onSearchChange={setSearchValue}
        isLoading={isFetching}
      />

      <CreateOrgDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        isCreating={createMutation.isPending}
        onConfirm={(input) => createMutation.mutate(input)}
      />
    </div>
  )
}
