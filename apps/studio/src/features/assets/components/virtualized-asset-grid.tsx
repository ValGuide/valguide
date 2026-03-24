import { useVirtualizer } from '@tanstack/react-virtual'
import type { AssetWithUsage } from '@valguide/core/features/assets/get-assets.fn'
import { type RefObject, useEffect, useState } from 'react'
import type { AssetCardComponent } from './assets-list'

const GRID_GAP = 16
const MOBILE_BOTTOM_PADDING = 96
const DESKTOP_BOTTOM_PADDING = 24

type VirtualizedAssetGridProps = {
  assets: AssetWithUsage[]
  AssetCard?: AssetCardComponent
  isMobile: boolean
  containerRef: RefObject<HTMLDivElement | null>
  scrollElementRef: RefObject<HTMLElement | null>
  scrollMargin: number
  onDelete?: (assetId: string) => void
  onOpenDetails: (asset: AssetWithUsage) => void
  selectedAssetIds?: Set<string>
  onToggleSelected?: (assetId: string, selected: boolean) => void
  onLoadMore?: () => void
  hasMore?: boolean
  isFetchingMore?: boolean
  shouldSuppressPreview?: () => boolean
}

function getGridColumnCount(width: number) {
  if (width >= 1280) {
    return 4
  }

  if (width >= 1024) {
    return 3
  }

  if (width >= 640) {
    return 2
  }

  return 1
}

export function VirtualizedAssetGrid({
  assets,
  AssetCard,
  isMobile,
  containerRef,
  scrollElementRef,
  scrollMargin,
  onDelete,
  onOpenDetails,
  selectedAssetIds,
  onToggleSelected,
  onLoadMore,
  hasMore = false,
  isFetchingMore = false,
  shouldSuppressPreview,
}: VirtualizedAssetGridProps) {
  const [columnCount, setColumnCount] = useState(1)

  useEffect(() => {
    const containerElement = containerRef.current

    if (!containerElement) {
      return
    }

    const updateColumnCount = () => {
      setColumnCount(getGridColumnCount(containerElement.clientWidth))
    }

    updateColumnCount()

    const resizeObserver = new ResizeObserver(updateColumnCount)
    resizeObserver.observe(containerElement)

    return () => {
      resizeObserver.disconnect()
    }
  }, [containerRef])

  const rowCount = Math.ceil(assets.length / columnCount)
  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => scrollElementRef.current,
    estimateSize: () => (isMobile ? 360 : 348),
    gap: GRID_GAP,
    overscan: 2,
    scrollMargin,
  })

  const virtualRows = rowVirtualizer.getVirtualItems()

  useEffect(() => {
    const lastVirtualRow = virtualRows[virtualRows.length - 1]

    if (!lastVirtualRow || !onLoadMore || !hasMore || isFetchingMore) {
      return
    }

    if (lastVirtualRow.index >= rowCount - 2) {
      onLoadMore()
    }
  }, [hasMore, isFetchingMore, onLoadMore, rowCount, virtualRows])

  if (!AssetCard) {
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
        const startIndex = virtualRow.index * columnCount
        const rowAssets = assets.slice(startIndex, startIndex + columnCount)

        return (
          <div
            key={virtualRow.key}
            data-index={virtualRow.index}
            ref={rowVirtualizer.measureElement}
            className="absolute left-0 top-0 grid w-full"
            style={{
              gap: `${GRID_GAP}px`,
              gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
              transform: `translateY(${virtualRow.start - scrollMargin}px)`,
            }}
          >
            {rowAssets.map((asset) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                onDelete={onDelete}
                onPreview={onOpenDetails}
                shouldSuppressPreview={shouldSuppressPreview}
                isSelected={selectedAssetIds?.has(asset.id)}
                onToggleSelected={onToggleSelected}
              />
            ))}
          </div>
        )
      })}
    </div>
  )
}
