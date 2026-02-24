import { useMutation } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@valguide/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@valguide/ui/components/card'
import { Input } from '@valguide/ui/components/input'
import { toast } from '@valguide/ui/components/sonner/state'
import { Database, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { kvBackfillAllToursFn } from '@/server/functions/kv-backfill-all-tours.fn'
import { kvBackfillOrgSlugsFn } from '@/server/functions/kv-backfill-org-slugs.fn'
import { kvBackfillTourFn } from '@/server/functions/kv-backfill-tour.fn'
import { kvBackfillTourSlugsFn } from '@/server/functions/kv-backfill-tour-slugs.fn'

export const Route = createFileRoute('/_main/kv-cache')({
  component: KvCachePage,
})

function KvCachePage() {
  const [tourNanoId, setTourNanoId] = useState('')

  const allToursMutation = useMutation({
    mutationFn: () => kvBackfillAllToursFn(),
    onSuccess: (result) => {
      const msg = `${result.toursProcessed} tours processed, ${result.kvEntriesWritten} KV entries written`
      if (result.errors.length > 0) {
        toast.warning(`${msg} — ${result.errors.length} errors (see console)`)
        console.error('Backfill errors:', result.errors)
      } else {
        toast.success(msg)
      }
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Backfill failed'),
  })

  const singleTourMutation = useMutation({
    mutationFn: (nanoId: string) => kvBackfillTourFn({ data: { tourNanoId: nanoId } }),
    onSuccess: (result) => {
      const msg = `${result.localesWritten} locales, ${result.slugsWritten} slugs written`
      if (result.errors.length > 0) {
        toast.warning(`${msg} — ${result.errors.length} errors (see console)`)
        console.error('Backfill errors:', result.errors)
      } else {
        toast.success(msg)
      }
      setTourNanoId('')
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Backfill failed'),
  })

  const orgSlugsMutation = useMutation({
    mutationFn: () => kvBackfillOrgSlugsFn(),
    onSuccess: (result) =>
      toast.success(`${result.orgsProcessed} orgs processed, ${result.kvEntriesWritten} KV entries written`),
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Backfill failed'),
  })

  const tourSlugsMutation = useMutation({
    mutationFn: () => kvBackfillTourSlugsFn(),
    onSuccess: (result) =>
      toast.success(`${result.toursProcessed} tours processed, ${result.kvEntriesWritten} KV entries written`),
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Backfill failed'),
  })

  const fullBackfillMutation = useMutation({
    mutationFn: async () => {
      const tours = await kvBackfillAllToursFn()
      const orgSlugs = await kvBackfillOrgSlugsFn()
      const tourSlugs = await kvBackfillTourSlugsFn()
      return { tours, orgSlugs, tourSlugs }
    },
    onSuccess: ({ tours, orgSlugs, tourSlugs }) => {
      const total = tours.kvEntriesWritten + orgSlugs.kvEntriesWritten + tourSlugs.kvEntriesWritten
      const msg = `Full backfill complete: ${total} KV entries written`
      if (tours.errors.length > 0) {
        toast.warning(`${msg} — ${tours.errors.length} errors (see console)`)
        console.error('Backfill errors:', tours.errors)
      } else {
        toast.success(msg)
      }
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Full backfill failed'),
  })

  const isAnyPending =
    allToursMutation.isPending ||
    singleTourMutation.isPending ||
    orgSlugsMutation.isPending ||
    tourSlugsMutation.isPending ||
    fullBackfillMutation.isPending

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Database className="size-6" />
        <h1 className="text-2xl font-bold">KV Cache</h1>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Tour Data</CardTitle>
            <CardDescription>Backfill KV cache with published tour data for all locales.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={() => allToursMutation.mutate()} disabled={isAnyPending}>
              {allToursMutation.isPending && <Loader2 className="size-4 animate-spin" />}
              Backfill All Tours
            </Button>

            <div className="flex items-center gap-2">
              <Input
                placeholder="Tour nanoId"
                value={tourNanoId}
                onChange={(e) => setTourNanoId(e.target.value)}
                className="max-w-xs"
              />
              <Button
                variant="outline"
                onClick={() => tourNanoId.trim() && singleTourMutation.mutate(tourNanoId.trim())}
                disabled={isAnyPending || !tourNanoId.trim()}
              >
                {singleTourMutation.isPending && <Loader2 className="size-4 animate-spin" />}
                Backfill Tour
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Org Slugs</CardTitle>
            <CardDescription>Backfill KV with org slug entries (current + historical redirects).</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => orgSlugsMutation.mutate()} disabled={isAnyPending}>
              {orgSlugsMutation.isPending && <Loader2 className="size-4 animate-spin" />}
              Backfill All Org Slugs
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tour Slugs</CardTitle>
            <CardDescription>Backfill KV with tour slug entries (current + historical redirects).</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => tourSlugsMutation.mutate()} disabled={isAnyPending}>
              {tourSlugsMutation.isPending && <Loader2 className="size-4 animate-spin" />}
              Backfill All Tour Slugs
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Full Backfill</CardTitle>
            <CardDescription>Run all backfill operations in sequence (tours + org slugs + tour slugs).</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => fullBackfillMutation.mutate()} disabled={isAnyPending}>
              {fullBackfillMutation.isPending && <Loader2 className="size-4 animate-spin" />}
              Backfill Everything
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
