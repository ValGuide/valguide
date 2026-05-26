import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import type { ManagedLinkDestination, ManagedLinkListItem } from '@valguide/core/features/links/managed-links.fn'
import {
  archiveManagedLinkFn,
  createManagedLinkFn,
  updateManagedLinkFn,
} from '@valguide/core/features/links/managed-links.fn'
import { toast } from '@valguide/core/ui/components/sonner/state'
import { Badge } from '@valguide/ui/components/badge'
import { Button } from '@valguide/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@valguide/ui/components/dialog'
import { Input } from '@valguide/ui/components/input'
import { Label } from '@valguide/ui/components/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@valguide/ui/components/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@valguide/ui/components/table'
import { Textarea } from '@valguide/ui/components/textarea'
import { Archive, Copy, ExternalLink, Pencil, Plus, QrCode, Search } from 'lucide-react'
import * as React from 'react'
import { ListPageHeader } from '@/components/list-page-header'
import { QrPreviewCard } from '@/features/qr/components/qr-preview-card'
import { orgQrBrandingQueryOptions } from '@/features/qr/query-options'
import { stopsQueryOptions } from '@/features/stops/query-options'
import { toursListQueryOptions } from '@/features/tours/query-options'
import { managedLinksQueryKeys, managedLinksQueryOptions } from '../query-options'

type DestinationType = ManagedLinkDestination['type']

type LinkFormState = {
  title: string
  description: string
  context: string
  expiresAt: string
  type: DestinationType
  tourNanoId: string
  stopNanoId: string
  campaignId: string
  externalUrl: string
  pageSlug: string
  locale: string
}

const emptyFormState: LinkFormState = {
  title: '',
  description: '',
  context: '',
  expiresAt: '',
  type: 'external',
  tourNanoId: '',
  stopNanoId: '',
  campaignId: '',
  externalUrl: '',
  pageSlug: '',
  locale: 'en',
}

const contextOptions = [
  'exhibition',
  'campaign',
  'event',
  'education',
  'accessibility',
  'wayfinding',
  'survey',
  'partner',
  'shop',
  'other',
]

function formatDate(value: Date | string | null): string {
  if (!value) return 'Never'
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return 'Never'
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function toDateInputValue(value: Date | string | null): string {
  if (!value) return ''
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 10)
}

function destinationTypeLabel(type: DestinationType): string {
  switch (type) {
    case 'tour':
      return 'Tour'
    case 'stop':
      return 'Stop'
    case 'campaign':
      return 'Campaign'
    case 'external':
      return 'External URL'
    case 'landing_page':
      return 'Landing page'
  }
}

function linkToFormState(link: ManagedLinkListItem): LinkFormState {
  const base = {
    ...emptyFormState,
    title: link.title,
    description: link.description ?? '',
    context: link.context ?? '',
    expiresAt: toDateInputValue(link.expiresAt),
    type: link.destination.type,
  }

  switch (link.destination.type) {
    case 'tour':
      return { ...base, tourNanoId: link.destination.tourNanoId }
    case 'stop':
      return { ...base, tourNanoId: link.destination.tourNanoId, stopNanoId: link.destination.stopNanoId }
    case 'campaign':
      return { ...base, campaignId: link.destination.campaignId }
    case 'external':
      return { ...base, externalUrl: link.destination.externalUrl }
    case 'landing_page':
      return { ...base, pageSlug: link.destination.pageSlug, locale: link.destination.locale }
  }
}

function formStateToDestination(form: LinkFormState): ManagedLinkDestination {
  switch (form.type) {
    case 'tour':
      return { type: 'tour', tourNanoId: form.tourNanoId }
    case 'stop':
      return { type: 'stop', tourNanoId: form.tourNanoId, stopNanoId: form.stopNanoId }
    case 'campaign':
      return { type: 'campaign', campaignId: form.campaignId }
    case 'external':
      return { type: 'external', externalUrl: form.externalUrl }
    case 'landing_page':
      return { type: 'landing_page', pageSlug: form.pageSlug, locale: form.locale }
  }
}

function statusVariant(status: ManagedLinkListItem['status']) {
  return status === 'active' ? 'default' : 'secondary'
}

export function LinksManagementPage() {
  const queryClient = useQueryClient()
  const { data: links } = useSuspenseQuery(managedLinksQueryOptions(true))
  const { data: qrSettings } = useSuspenseQuery(orgQrBrandingQueryOptions())
  const { data: tours } = useSuspenseQuery(toursListQueryOptions('en'))
  const { data: stops } = useSuspenseQuery(stopsQueryOptions('en'))

  const [query, setQuery] = React.useState('')
  const [typeFilter, setTypeFilter] = React.useState<DestinationType | 'all'>('all')
  const [editingLink, setEditingLink] = React.useState<ManagedLinkListItem | null>(null)
  const [qrLink, setQrLink] = React.useState<ManagedLinkListItem | null>(null)
  const [formOpen, setFormOpen] = React.useState(false)

  const invalidateLinks = async () => {
    await queryClient.invalidateQueries({ queryKey: managedLinksQueryKeys.all })
  }

  const createMutation = useMutation({
    mutationFn: (form: LinkFormState) =>
      createManagedLinkFn({
        data: {
          title: form.title,
          description: form.description || null,
          context: form.context || null,
          expiresAt: form.expiresAt || null,
          destination: formStateToDestination(form),
        },
      }),
    onSuccess: async () => {
      await invalidateLinks()
      setFormOpen(false)
      toast.success('Link created')
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : 'Failed to create link'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, form }: { id: number; form: LinkFormState }) =>
      updateManagedLinkFn({
        data: {
          id,
          values: {
            title: form.title,
            description: form.description || null,
            context: form.context || null,
            expiresAt: form.expiresAt || null,
            destination: formStateToDestination(form),
          },
        },
      }),
    onSuccess: async () => {
      await invalidateLinks()
      setFormOpen(false)
      setEditingLink(null)
      toast.success('Link updated')
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : 'Failed to update link'),
  })

  const archiveMutation = useMutation({
    mutationFn: (id: number) => archiveManagedLinkFn({ data: { id } }),
    onSuccess: async () => {
      await invalidateLinks()
      toast.success('Link archived')
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : 'Failed to archive link'),
  })

  const filteredLinks = links.filter((link) => {
    const haystack = `${link.title} ${link.shortUrl} ${link.destinationLabel} ${link.context ?? ''}`.toLowerCase()
    const matchesQuery = !query || haystack.includes(query.toLowerCase())
    const matchesType = typeFilter === 'all' || link.type === typeFilter
    return matchesQuery && matchesType
  })

  const handleCopy = async (shortUrl: string) => {
    await navigator.clipboard.writeText(shortUrl)
    toast.success('Short link copied')
  }

  return (
    <main className="flex min-w-0 flex-1 flex-col gap-4 p-4 pt-0">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 pb-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <ListPageHeader
            title="QR & Links"
            description="Manage stable public entry points for museum signage, campaigns, events, accessibility resources, and visitor workflows."
          />
          <Button
            className="w-full sm:w-auto"
            onClick={() => {
              setEditingLink(null)
              setFormOpen(true)
            }}
          >
            <Plus className="size-4" />
            New link
          </Button>
        </div>

        <div className="flex flex-col gap-3 rounded-lg border bg-background p-3 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="pl-9"
              placeholder="Search links"
            />
          </div>
          <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as DestinationType | 'all')}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="tour">Tours</SelectItem>
              <SelectItem value="stop">Stops</SelectItem>
              <SelectItem value="landing_page">Landing pages</SelectItem>
              <SelectItem value="campaign">Campaigns</SelectItem>
              <SelectItem value="external">External URLs</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-hidden rounded-lg border bg-background">
          {filteredLinks.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Link</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Context</TableHead>
                  <TableHead className="text-right">Opens</TableHead>
                  <TableHead>Last opened</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[220px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLinks.map((link) => (
                  <TableRow key={link.id}>
                    <TableCell className="max-w-[280px] whitespace-normal">
                      <div className="min-w-0 space-y-1">
                        <p className="truncate font-medium">{link.title}</p>
                        <p className="break-all font-mono text-xs text-muted-foreground">{link.shortUrl}</p>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[260px] whitespace-normal">
                      <div className="space-y-1">
                        <Badge variant="outline">{destinationTypeLabel(link.type)}</Badge>
                        <p className="break-all text-sm text-muted-foreground">{link.destinationLabel}</p>
                      </div>
                    </TableCell>
                    <TableCell>{link.context ? <Badge variant="secondary">{link.context}</Badge> : '-'}</TableCell>
                    <TableCell className="text-right tabular-nums">{link.openCount.toLocaleString()}</TableCell>
                    <TableCell>{formatDate(link.lastOpenedAt)}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(link.status)}>{link.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Copy short link"
                          onClick={() => void handleCopy(link.shortUrl)}
                        >
                          <Copy className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon" aria-label="Show QR code" onClick={() => setQrLink(link)}>
                          <QrCode className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon" aria-label="Open short link" asChild>
                          <a href={link.shortUrl} target="_blank" rel="noreferrer">
                            <ExternalLink className="size-4" />
                          </a>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Edit link"
                          onClick={() => {
                            setEditingLink(link)
                            setFormOpen(true)
                          }}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Archive link"
                          disabled={link.status === 'archived' || archiveMutation.isPending}
                          onClick={() => archiveMutation.mutate(link.id)}
                        >
                          <Archive className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
              <QrCode className="size-8 text-muted-foreground" />
              <div className="space-y-1">
                <h2 className="font-medium">No links found</h2>
                <p className="max-w-md text-sm text-muted-foreground">
                  Create a stable QR and short-link entry point for a tour, event, campaign, resource, or external URL.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <LinkFormDialog
        open={formOpen}
        link={editingLink}
        tours={tours}
        stops={stops}
        pending={createMutation.isPending || updateMutation.isPending}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setEditingLink(null)
        }}
        onSubmit={(form) => {
          if (editingLink) {
            updateMutation.mutate({ id: editingLink.id, form })
          } else {
            createMutation.mutate(form)
          }
        }}
      />

      <Dialog open={!!qrLink} onOpenChange={(open) => !open && setQrLink(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{qrLink?.title}</DialogTitle>
            <DialogDescription>{qrLink?.shortUrl}</DialogDescription>
          </DialogHeader>
          {qrLink ? (
            <QrPreviewCard
              shortUrl={qrLink.shortUrl}
              branding={qrSettings.effectiveBranding}
              downloadFileName={qrLink.title}
              sourceLabel="Workspace default"
              variant="plain"
              showHeader={false}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </main>
  )
}

function LinkFormDialog({
  open,
  link,
  tours,
  stops,
  pending,
  onOpenChange,
  onSubmit,
}: {
  open: boolean
  link: ManagedLinkListItem | null
  tours: Array<{ nanoId: string; title: string | null }>
  stops: Array<{ nanoId: string; title: string | null }>
  pending: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (form: LinkFormState) => void
}) {
  const [form, setForm] = React.useState<LinkFormState>(emptyFormState)

  React.useEffect(() => {
    setForm(link ? linkToFormState(link) : emptyFormState)
  }, [link, open])

  const setField = <Key extends keyof LinkFormState>(key: Key, value: LinkFormState[Key]) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    onSubmit(form)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(760px,calc(100vh-2rem))] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{link ? 'Edit link' : 'Create link'}</DialogTitle>
          <DialogDescription>
            Managed links are scoped to the current workspace and can be exported as QR codes.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="link-title">Title</Label>
              <Input
                id="link-title"
                value={form.title}
                onChange={(event) => setField('title', event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Destination type</Label>
              <Select value={form.type} onValueChange={(value) => setField('type', value as DestinationType)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="external">External URL</SelectItem>
                  <SelectItem value="tour">Tour</SelectItem>
                  <SelectItem value="stop">Stop</SelectItem>
                  <SelectItem value="landing_page">Landing page</SelectItem>
                  <SelectItem value="campaign">Campaign</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Context</Label>
              <Select
                value={form.context || 'none'}
                onValueChange={(value) => setField('context', value === 'none' ? '' : value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {contextOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {form.type === 'external' ? (
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="link-external">External URL</Label>
                <Input
                  id="link-external"
                  value={form.externalUrl}
                  onChange={(event) => setField('externalUrl', event.target.value)}
                  placeholder="https://museum.example/resource"
                  required
                />
              </div>
            ) : null}

            {form.type === 'tour' || form.type === 'stop' ? (
              <div className="space-y-2">
                <Label>Tour</Label>
                <Select
                  value={form.tourNanoId || 'none'}
                  onValueChange={(value) => setField('tourNanoId', value === 'none' ? '' : value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select tour" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Select tour</SelectItem>
                    {tours.map((tour) => (
                      <SelectItem key={tour.nanoId} value={tour.nanoId}>
                        {tour.title || tour.nanoId}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}

            {form.type === 'stop' ? (
              <div className="space-y-2">
                <Label>Stop</Label>
                <Select
                  value={form.stopNanoId || 'none'}
                  onValueChange={(value) => setField('stopNanoId', value === 'none' ? '' : value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select stop" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Select stop</SelectItem>
                    {stops.map((stop) => (
                      <SelectItem key={stop.nanoId} value={stop.nanoId}>
                        {stop.title || stop.nanoId}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}

            {form.type === 'landing_page' ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="link-page-slug">Page slug</Label>
                  <Input
                    id="link-page-slug"
                    value={form.pageSlug}
                    onChange={(event) => setField('pageSlug', event.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="link-locale">Locale</Label>
                  <Input
                    id="link-locale"
                    value={form.locale}
                    onChange={(event) => setField('locale', event.target.value)}
                    required
                  />
                </div>
              </>
            ) : null}

            {form.type === 'campaign' ? (
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="link-campaign">Campaign identifier</Label>
                <Input
                  id="link-campaign"
                  value={form.campaignId}
                  onChange={(event) => setField('campaignId', event.target.value)}
                  required
                />
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="link-expiry">Expiry date</Label>
              <Input
                id="link-expiry"
                type="date"
                value={form.expiresAt}
                onChange={(event) => setField('expiresAt', event.target.value)}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="link-description">Internal description</Label>
              <Textarea
                id="link-description"
                value={form.description}
                onChange={(event) => setField('description', event.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? 'Saving...' : 'Save link'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
