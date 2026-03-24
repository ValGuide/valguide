import { useVirtualizer } from '@tanstack/react-virtual'
import type { AssetWithUsage } from '@valguide/core/features/assets/get-assets.fn'
import { type RefObject, useEffect } from 'react'
import type { AssetListRowComponent } from './assets-list'

const MOBILE_BOTTOM_PADDING = 96
const DESKTOP_BOTTOM_PADDING = 24

type VirtualizedAssetListProps = {
  assets: AssetWithUsage[]
  AssetListRow?: AssetListRowComponent
  isMobile: boolean
  scrollElementRef: RefObject<HTMLElement | null>
  scrollMargin: number
  onDelete?: (assetId: string) => void
  onOpenDetails: (asset: AssetWithUsage) => void
  selectedAssetIds?: Set<string>
  onToggleSelected?: (assetId: string, selected: boolean) => void
  onLoadMore?: () => void
  hasMore?: boolean
  isFetchingMore?: boolean
  shouldSuppressOpenDetails?: () => boolean
}

export function VirtualizedAssetList({
  assets,
  AssetListRow,
  isMobile,
  scrollElementRef,
  scrollMargin,
  onDelete,
  onOpenDetails,
  selectedAssetIds,
  onToggleSelected,
  onLoadMore,
  hasMore = false,
  isFetchingMore = false,
  shouldSuppressOpenDetails,
}: VirtualizedAssetListProps) {
  const rowVirtualizer = useVirtualizer({
    count: assets.length,
    getScrollElement: () => scrollElementRef.current,
    estimateSize: () => (isMobile ? 72 : 63),
    overscan: isMobile ? 8 : 10,
    scrollMargin,
  })

  const virtualRows = rowVirtualizer.getVirtualItems()

  useEffect(() => {
    const lastVirtualRow = virtualRows[virtualRows.length - 1]

    if (!lastVirtualRow || !onLoadMore || !hasMore || isFetchingMore) {
      return
    }

    if (lastVirtualRow.index >= assets.length - 5) {
      onLoadMore()
    }
  }, [assets.length, hasMore, isFetchingMore, onLoadMore, virtualRows])

  if (!AssetListRow) {
    return null
  }

  return (
    <div
      className="relative w-full"
      style={{
        height: `${rowVirtualizer.getTotalSize() + (isMobile ? MOBILE_BOTTOM_PADDING : DESKTOP_BOTTOM_PADDING)}px`,
      }}
    >
      {virtualRows.map((virtualRow) => {
        const asset = assets[virtualRow.index]

        if (!asset) {
          return null
        }

        return (
          <div
            key={virtualRow.key}
            data-index={virtualRow.index}
            ref={rowVirtualizer.measureElement}
            className="absolute left-0 top-0 w-full"
            style={{
              transform: `translateY(${virtualRow.start - scrollMargin}px)`,
            }}
          >
            <AssetListRow
              asset={asset}
              variant={isMobile ? 'mobile' : 'desktop'}
              onDelete={onDelete}
              onOpenDetails={onOpenDetails}
              shouldSuppressOpenDetails={shouldSuppressOpenDetails}
              isSelected={selectedAssetIds?.has(asset.id)}
              onToggleSelected={onToggleSelected}
            />
          </div>
        )
      })}
    </div>
  )
}
