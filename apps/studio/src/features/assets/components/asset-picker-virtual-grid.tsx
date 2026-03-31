import { useVirtualizer } from '@tanstack/react-virtual'
import type { Asset } from '@valguide/core/features/assets/types'
import { type ReactNode, useEffect, useRef, useState } from 'react'

const LOADING_MORE_HEIGHT = 48
const MOBILE_BOTTOM_PADDING = 96
const TABLET_BOTTOM_PADDING = 32
const DESKTOP_BOTTOM_PADDING = 24
const MOBILE_SINGLE_COLUMN_ROW_ESTIMATE = 280
const MOBILE_MULTI_COLUMN_ROW_ESTIMATE = 236
const DESKTOP_ROW_ESTIMATE = 328

type AssetPickerVirtualGridProps = {
  assets: Asset[]
  renderAsset: (asset: Asset) => ReactNode
  isMobile?: boolean
  loadingMoreLabel?: string
  onLoadMore?: () => void
  hasMore?: boolean
  isFetchingMore?: boolean
}

function getGridColumnCount(viewportWidth: number) {
  if (viewportWidth >= 1024) {
    return 3
  }

  if (viewportWidth >= 560) {
    return 2
  }

  return 1
}

function getGridGap(viewportWidth: number) {
  if (viewportWidth >= 1024) {
    return 20
  }

  if (viewportWidth >= 560) {
    return 16
  }

  return 12
}

export function AssetPickerVirtualGrid({
  assets,
  renderAsset,
  isMobile = false,
  loadingMoreLabel,
  onLoadMore,
  hasMore = false,
  isFetchingMore = false,
}: AssetPickerVirtualGridProps) {
  const scrollElementRef = useRef<HTMLDivElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [columnCount, setColumnCount] = useState(1)
  const [gridGap, setGridGap] = useState(12)

  useEffect(() => {
    const containerElement = containerRef.current

    if (!containerElement) {
      return
    }

    const updateColumnCount = () => {
      const width = containerElement.clientWidth
      setColumnCount(getGridColumnCount(width))
      setGridGap(getGridGap(width))
    }

    updateColumnCount()

    const resizeObserver = new ResizeObserver(updateColumnCount)
    resizeObserver.observe(containerElement)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  const rowCount = Math.ceil(assets.length / columnCount)
  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => scrollElementRef.current,
    estimateSize: () => {
      if (!isMobile) {
        return DESKTOP_ROW_ESTIMATE
      }

      return columnCount === 1 ? MOBILE_SINGLE_COLUMN_ROW_ESTIMATE : MOBILE_MULTI_COLUMN_ROW_ESTIMATE
    },
    gap: gridGap,
    overscan: 3,
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

  return (
    <div ref={containerRef} className="h-full min-h-0">
      <div ref={scrollElementRef} className="h-full min-h-0 overflow-y-auto">
        <div
          className="relative w-full"
          style={{
            height: `${rowVirtualizer.getTotalSize() + (isFetchingMore ? LOADING_MORE_HEIGHT : 0) + (isMobile ? MOBILE_BOTTOM_PADDING : columnCount === 2 ? TABLET_BOTTOM_PADDING : DESKTOP_BOTTOM_PADDING)}px`,
          }}
        >
          {virtualRows.map((virtualRow) => {
            const startIndex = virtualRow.index * columnCount
            const rowAssets = assets.slice(startIndex, startIndex + columnCount)

            return (
              <div
                key={virtualRow.key}
                data-index={virtualRow.index}
                className="absolute left-0 top-0 grid w-full"
                ref={rowVirtualizer.measureElement}
                style={{
                  gap: `${gridGap}px`,
                  gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                {rowAssets.map((asset) => (
                  <div key={asset.id}>{renderAsset(asset)}</div>
                ))}
              </div>
            )
          })}
          {isFetchingMore ? (
            <div
              className="absolute inset-x-0 text-center text-sm text-muted-foreground"
              style={{ top: `${rowVirtualizer.getTotalSize()}px`, height: `${LOADING_MORE_HEIGHT}px` }}
            >
              <div className="flex h-full items-center justify-center">{loadingMoreLabel}</div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
