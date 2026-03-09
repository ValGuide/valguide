import type { AssetWithUsage } from '@valguide/core/features/assets/get-assets.fn'
import { getAssetImageUrl } from '@valguide/core/features/assets/image-url'
import type { Asset, AssetType } from '@valguide/core/features/assets/types'
import { formatFileSize } from '@valguide/core/features/assets/utils'
import { useTranslations } from '@valguide/core/i18n/client'
import { Badge } from '@valguide/ui/components/badge'
import { Button } from '@valguide/ui/components/button'
import { Checkbox } from '@valguide/ui/components/checkbox'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@valguide/ui/components/dialog'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@valguide/ui/components/empty'
import { Image } from '@valguide/ui/components/image'
import { Input } from '@valguide/ui/components/input'
import { Skeleton } from '@valguide/ui/components/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@valguide/ui/components/tabs'
import { formatDistanceToNow } from 'date-fns'
import { Image as ImageIcon, Music, Search, Video } from 'lucide-react'
import type { ComponentType } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { AssetPickerVirtualGrid } from './asset-picker-virtual-grid'

export type UploadInlineComponentProps = {
  organizationId: string
  allowedTypes?: AssetType[]
  locale?: string
  onUploadComplete?: (asset: Asset) => void
}

export type UploadInlineComponent = ComponentType<UploadInlineComponentProps>

export type AssetPickerModalProps = {
  organizationId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  type: AssetType
  locale?: string
  multiple?: boolean
  selectedAssetIds?: string[]
  onSelect: (assets: Asset[]) => void
  assets: AssetWithUsage[]
  isLoading: boolean
  isFetchingMore?: boolean
  hasMore?: boolean
  searchQuery?: string
  onSearchQueryChange?: (value: string) => void
  onLoadMore?: () => void
  onRefetch?: () => void
  onUploadComplete?: (asset: Asset) => void
  UploadInline?: UploadInlineComponent
}

export function AssetPickerModal({
  organizationId,
  open,
  onOpenChange,
  type,
  locale,
  multiple = false,
  selectedAssetIds = [],
  onSelect,
  assets,
  isLoading,
  isFetchingMore = false,
  hasMore = false,
  searchQuery: controlledSearchQuery,
  onSearchQueryChange,
  onLoadMore,
  onRefetch,
  onUploadComplete: onUploadCompleteProp,
  UploadInline,
}: AssetPickerModalProps) {
  const t = useTranslations('assets.picker')
  // i18n-used-keys: assets.types.image, assets.types.audio, assets.types.video
  const tTypes = useTranslations('assets.types')
  const tFilter = useTranslations('assets.filter')
  const [activeTab, setActiveTab] = useState<'library' | 'upload'>('library')
  const [internalSearchQuery, setInternalSearchQuery] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set(selectedAssetIds))
  const selectedAssetIdsKey = useMemo(() => [...selectedAssetIds].sort().join('|'), [selectedAssetIds])
  const searchQuery = controlledSearchQuery ?? internalSearchQuery

  const setSearchQuery = (value: string) => {
    if (!onSearchQueryChange) {
      setInternalSearchQuery(value)
      return
    }

    onSearchQueryChange(value)
  }

  const displayedAssets = useMemo(() => assets, [assets])

  useEffect(() => {
    setSelected(new Set(selectedAssetIds))
  }, [selectedAssetIds, selectedAssetIdsKey])

  const handleToggleAsset = (assetId: string) => {
    const newSelected = new Set(selected)
    if (newSelected.has(assetId)) {
      newSelected.delete(assetId)
    } else {
      if (multiple) {
        newSelected.add(assetId)
      } else {
        newSelected.clear()
        newSelected.add(assetId)
      }
    }
    setSelected(newSelected)
  }

  const handleSelect = () => {
    const selectedAssets = assets.filter((asset) => selected.has(asset.id))
    onSelect(selectedAssets)
    onOpenChange(false)
  }

  const handleUploadComplete = (asset: Asset) => {
    onUploadCompleteProp?.(asset)
    onRefetch?.()
    setActiveTab('library')
    if (!multiple) {
      const newSelected = new Set([asset.id])
      setSelected(newSelected)
    }
  }

  const handleCancel = () => {
    setSelected(new Set(selectedAssetIds))
    onOpenChange(false)
  }

  const getTypeIcon = () => {
    switch (type) {
      case 'image':
        return <ImageIcon className="h-12 w-12 text-muted-foreground" />
      case 'audio':
        return <Music className="h-12 w-12 text-muted-foreground" />
      case 'video':
        return <Video className="h-12 w-12 text-muted-foreground" />
    }
  }

  const renderAssetCard = (asset: Asset) => {
    const isSelected = selected.has(asset.id)

    return (
      // biome-ignore lint/a11y/useSemanticElements: Cannot use button due to nested Checkbox which renders as button
      <div
        role="button"
        tabIndex={0}
        key={asset.id}
        className={`relative rounded-lg border-2 transition-all cursor-pointer hover:shadow-md text-left ${
          isSelected ? 'border-primary shadow-sm' : 'border-border'
        }`}
        onClick={() => handleToggleAsset(asset.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleToggleAsset(asset.id)
          }
        }}
      >
        <div className="absolute top-2 right-2 z-10">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => handleToggleAsset(asset.id)}
            onClick={(e) => e.stopPropagation()}
            className="h-6 w-6 border-2 shadow-sm bg-background/80 backdrop-blur-sm data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
        </div>

        <div className="flex h-40 items-center justify-center overflow-hidden rounded-t-lg bg-muted">
          {asset.type === 'image' ? (
            <Image
              src={getAssetImageUrl(asset)}
              alt={asset.fileName}
              layout="constrained"
              width={300}
              height={160}
              className="h-full w-full object-cover"
            />
          ) : (
            getTypeIcon()
          )}
        </div>

        <div className="space-y-2 p-3">
          <h4 className="line-clamp-1 text-sm font-medium" title={asset.fileName}>
            {asset.fileName}
          </h4>
          <div className="flex flex-wrap gap-1">
            <Badge variant="secondary" className="text-xs">
              {formatFileSize(asset.fileSize)}
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(asset.createdAt), { addSuffix: true })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-5xl grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            {locale
              ? t('titleWithLocale', { type: tTypes(type), locale: locale.toUpperCase() })
              : t('title', { type: tTypes(type) })}
          </DialogTitle>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as 'library' | 'upload')}
          className="flex-1 flex flex-col min-h-0"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="library">{t('tabs.library')}</TabsTrigger>
            <TabsTrigger value="upload">{t('tabs.upload')}</TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="flex-1 flex flex-col min-h-0 mt-4">
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={tFilter('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              {isLoading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {[...Array(6)].map((_, i) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: skeleton items have no unique ID
                    <div key={i} className="space-y-3">
                      <Skeleton className="h-40 w-full rounded-lg" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  ))}
                </div>
              ) : displayedAssets.length === 0 ? (
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">{getTypeIcon()}</EmptyMedia>
                    <EmptyTitle>{t('noAssets', { type: tTypes(type) })}</EmptyTitle>
                    <EmptyDescription>{searchQuery ? tFilter('noResults') : t('empty.description')}</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <>
                  <div className="min-h-0 flex-1">
                    <AssetPickerVirtualGrid
                      assets={displayedAssets}
                      renderAsset={renderAssetCard}
                      onLoadMore={onLoadMore}
                      hasMore={hasMore}
                      isFetchingMore={isFetchingMore}
                    />
                  </div>
                  {isFetchingMore ? (
                    <div className="shrink-0 py-3 text-center text-sm text-muted-foreground">{t('loadingMore')}</div>
                  ) : null}
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="upload" className="flex-1 flex flex-col min-h-0 mt-4">
            {UploadInline && (
              <UploadInline
                allowedTypes={[type]}
                locale={locale}
                onUploadComplete={handleUploadComplete}
                organizationId={organizationId}
              />
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex items-center justify-end gap-2">
          <Button variant="outline" onClick={handleCancel}>
            {t('cancel')}
          </Button>
          <Button onClick={handleSelect} disabled={selected.size === 0}>
            {t('select')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
