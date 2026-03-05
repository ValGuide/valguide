import type { AssetSortBy, AssetSortDirection, AssetWithUsage } from '@valguide/core/features/assets/get-assets.fn'
import type { Asset, AssetType } from '@valguide/core/features/assets/types'
import { useTranslations } from '@valguide/core/i18n/client'
import { Button } from '@valguide/ui/components/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@valguide/ui/components/empty'
import { Input } from '@valguide/ui/components/input'
import { PageTitle } from '@valguide/ui/components/page-title'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@valguide/ui/components/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@valguide/ui/components/tabs'
import { Image as ImageIcon, Search, Upload } from 'lucide-react'
import type { ComponentType } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { AssetUploadInlineProps } from '@/features/assets/components/asset-upload-inline.tsx'

export type AssetCardComponentProps = {
  asset: AssetWithUsage
  onDelete?: (assetId: string) => void
}

export type AssetCardComponent = ComponentType<AssetCardComponentProps>

export type UploadInlineComponent = ComponentType<AssetUploadInlineProps>

export type AssetsListProps = {
  organizationId: string
  locale?: string
  assets?: AssetWithUsage[]
  hasMore?: boolean
  isFetchingMore?: boolean
  isQueryPending?: boolean
  error?: Error | null
  onAssetDeleted?: (assetId: string) => void
  onUploadComplete?: (asset: Asset) => void
  onLoadMore?: () => void
  onRetry?: () => void
  typeFilter?: AssetType | 'all'
  onTypeFilterChange?: (value: AssetType | 'all') => void
  searchQuery?: string
  onSearchQueryChange?: (value: string) => void
  sortBy?: AssetSortBy
  sortDirection?: AssetSortDirection
  onSortChange?: (sortBy: AssetSortBy, sortDirection: AssetSortDirection) => void
  AssetCard?: AssetCardComponent
  UploadInline?: UploadInlineComponent
}

export function AssetsList({
  locale,
  organizationId,
  assets = [],
  hasMore = false,
  isFetchingMore = false,
  isQueryPending = false,
  error = null,
  onAssetDeleted,
  onUploadComplete,
  onLoadMore,
  onRetry,
  typeFilter: controlledTypeFilter,
  onTypeFilterChange,
  searchQuery: controlledSearchQuery,
  onSearchQueryChange,
  sortBy: controlledSortBy,
  sortDirection: controlledSortDirection,
  onSortChange,
  AssetCard,
  UploadInline,
}: AssetsListProps) {
  const t = useTranslations('assets')
  const [activeTab, setActiveTab] = useState<'library' | 'upload'>('library')
  const [internalTypeFilter, setInternalTypeFilter] = useState<AssetType | 'all'>('all')
  const [internalSearchQuery, setInternalSearchQuery] = useState('')
  const [internalSortBy, setInternalSortBy] = useState<AssetSortBy>('createdAt')
  const [internalSortDirection, setInternalSortDirection] = useState<AssetSortDirection>('desc')
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  const typeFilter = controlledTypeFilter ?? internalTypeFilter
  const searchQuery = controlledSearchQuery ?? internalSearchQuery
  const sortBy = controlledSortBy ?? internalSortBy
  const sortDirection = controlledSortDirection ?? internalSortDirection

  const setTypeFilter = (value: AssetType | 'all') => {
    if (!onTypeFilterChange) {
      setInternalTypeFilter(value)
      return
    }
    onTypeFilterChange(value)
  }

  const setSearchQuery = (value: string) => {
    if (!onSearchQueryChange) {
      setInternalSearchQuery(value)
      return
    }
    onSearchQueryChange(value)
  }

  const setSort = (nextSortBy: AssetSortBy, nextSortDirection: AssetSortDirection) => {
    if (!onSortChange) {
      setInternalSortBy(nextSortBy)
      setInternalSortDirection(nextSortDirection)
      return
    }
    onSortChange(nextSortBy, nextSortDirection)
  }

  const isControlledMode = Boolean(onTypeFilterChange && onSearchQueryChange && onSortChange)

  const displayedAssets = useMemo(() => {
    if (isControlledMode) {
      return assets ?? []
    }

    const matchingAssets = (assets ?? []).filter((asset) => {
      const matchesType = typeFilter === 'all' || asset.type === typeFilter
      const matchesSearch = !searchQuery || asset.fileName.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesType && matchesSearch
    })

    return [...matchingAssets].sort((left, right) => {
      if (sortBy === 'name') {
        const nameComparison = left.fileName.localeCompare(right.fileName, undefined, { sensitivity: 'base' })
        if (nameComparison !== 0) {
          return sortDirection === 'asc' ? nameComparison : -nameComparison
        }
      } else {
        const createdAtComparison = new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()
        if (createdAtComparison !== 0) {
          return sortDirection === 'asc' ? createdAtComparison : -createdAtComparison
        }
      }

      const idComparison = left.id.localeCompare(right.id)
      return sortDirection === 'asc' ? idComparison : -idComparison
    })
  }, [assets, isControlledMode, searchQuery, sortBy, sortDirection, typeFilter])

  const handleUploadComplete = (asset: Asset) => {
    onUploadComplete?.(asset)
    setActiveTab('library')
  }

  useEffect(() => {
    if (!onLoadMore || !hasMore || isFetchingMore || isQueryPending || !loadMoreRef.current) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onLoadMore()
        }
      },
      { rootMargin: '300px 0px' },
    )

    const sentinel = loadMoreRef.current
    if (!sentinel) {
      return
    }

    observer.observe(sentinel)
    return () => {
      observer.disconnect()
    }
  }, [hasMore, isFetchingMore, isQueryPending, onLoadMore, displayedAssets.length])

  // Error state
  if (error) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ImageIcon className="text-destructive" />
          </EmptyMedia>
          <EmptyTitle>{t('error.failedToLoad')}</EmptyTitle>
          <EmptyDescription>{error.message || t('error.unexpected')}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={onRetry} variant="outline">
            {t('error.tryAgain')}
          </Button>
        </EmptyContent>
      </Empty>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <PageTitle as="h2">{t('title')}</PageTitle>
          <p className="text-sm text-muted-foreground">{t('description')}</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'library' | 'upload')} className="space-y-6">
        <TabsList>
          <TabsTrigger value="library" className="gap-2">
            <ImageIcon className="h-4 w-4" />
            {t('picker.tabs.library')}
          </TabsTrigger>
          <TabsTrigger value="upload" className="gap-2">
            <Upload className="h-4 w-4" />
            {t('picker.tabs.upload')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="library" className="space-y-6">
          <div className="sticky top-0 z-20 border-b bg-background pb-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_180px_180px_180px]">
              <div className="space-y-1">
                <label htmlFor="asset-search" className="text-xs text-muted-foreground">
                  {t('filter.searchLabel')}
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="asset-search"
                    aria-label={t('filter.searchLabel')}
                    placeholder={t('filter.searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="asset-type-filter" className="text-xs text-muted-foreground">
                  {t('filter.typeLabel')}
                </label>
                <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as AssetType | 'all')}>
                  <SelectTrigger id="asset-type-filter" aria-label={t('filter.typeLabel')} className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('filter.all')}</SelectItem>
                    <SelectItem value="image">{t('filter.image')}</SelectItem>
                    <SelectItem value="audio">{t('filter.audio')}</SelectItem>
                    <SelectItem value="video">{t('filter.video')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label htmlFor="asset-sort-by" className="text-xs text-muted-foreground">
                  {t('filter.sortBy.label')}
                </label>
                <Select
                  value={sortBy}
                  onValueChange={(value) => {
                    const nextSortBy = value as AssetSortBy
                    const nextSortDirection: AssetSortDirection = nextSortBy === 'name' ? 'asc' : 'desc'
                    setSort(nextSortBy, nextSortDirection)
                  }}
                >
                  <SelectTrigger id="asset-sort-by" aria-label={t('filter.sortBy.label')} className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">{t('filter.sortBy.uploadedAt')}</SelectItem>
                    <SelectItem value="name">{t('filter.sortBy.name')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label htmlFor="asset-sort-order" className="text-xs text-muted-foreground">
                  {t('filter.order.label')}
                </label>
                <Select value={sortDirection} onValueChange={(value) => setSort(sortBy, value as AssetSortDirection)}>
                  <SelectTrigger id="asset-sort-order" aria-label={t('filter.order.label')} className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sortBy === 'createdAt' ? (
                      <>
                        <SelectItem value="desc">{t('filter.order.uploadedAtDesc')}</SelectItem>
                        <SelectItem value="asc">{t('filter.order.uploadedAtAsc')}</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="asc">{t('filter.order.nameAsc')}</SelectItem>
                        <SelectItem value="desc">{t('filter.order.nameDesc')}</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {displayedAssets.length === 0 ? (
            <Empty className="border border-dashed">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ImageIcon />
                </EmptyMedia>
                <EmptyTitle>
                  {searchQuery || typeFilter !== 'all' ? t('filter.noResults') : t('empty.title')}
                </EmptyTitle>
                <EmptyDescription>
                  {searchQuery || typeFilter !== 'all' ? t('filter.noResults') : t('empty.description')}
                </EmptyDescription>
              </EmptyHeader>
              {!searchQuery && typeFilter === 'all' && (
                <EmptyContent>
                  <Button onClick={() => setActiveTab('upload')} size="lg">
                    <Upload className="mr-2 h-4 w-4" />
                    {t('empty.uploadButton')}
                  </Button>
                </EmptyContent>
              )}
            </Empty>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {displayedAssets.map((asset) =>
                  AssetCard ? <AssetCard key={asset.id} asset={asset} onDelete={onAssetDeleted} /> : null,
                )}
              </div>
              <div ref={loadMoreRef} aria-hidden="true" className="h-1 w-full" />
              {isFetchingMore ? (
                <div className="py-3 text-center text-sm text-muted-foreground">{t('loadingMore')}</div>
              ) : null}
            </div>
          )}
        </TabsContent>

        <TabsContent value="upload" className="space-y-6">
          <div className="mx-auto w-full max-w-2xl">
            {UploadInline && (
              <UploadInline onUploadComplete={handleUploadComplete} organizationId={organizationId} locale={locale} />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
