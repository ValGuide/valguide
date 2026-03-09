import { useVirtualizer } from '@tanstack/react-virtual'
import type { Asset } from '@valguide/core/features/assets/types'
import { type ReactNode, useEffect, useRef, useState } from 'react'

const GRID_GAP = 16
const ROW_ESTIMATE = 236

type AssetPickerVirtualGridProps = {
  assets: Asset[]
  renderAsset: (asset: Asset) => ReactNode
}

function getGridColumnCount(viewportWidth: number) {
  if (viewportWidth >= 1024) {
    return 3
  }

  if (viewportWidth >= 640) {
    return 2
  }

  return 1
}

export function AssetPickerVirtualGrid({ assets, renderAsset }: AssetPickerVirtualGridProps) {
  const scrollElementRef = useRef<HTMLDivElement | null>(null)
  const [columnCount, setColumnCount] = useState(1)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const updateColumnCount = () => {
      setColumnCount(getGridColumnCount(window.innerWidth))
    }

    const frameId = window.requestAnimationFrame(updateColumnCount)
    window.addEventListener('resize', updateColumnCount)

    return () => {
      window.cancelAnimationFrame(frameId)
      window.removeEventListener('resize', updateColumnCount)
    }
  }, [])

  const rowCount = Math.ceil(assets.length / columnCount)
  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => scrollElementRef.current,
    estimateSize: () => ROW_ESTIMATE,
    gap: GRID_GAP,
    overscan: 3,
  })

  const virtualRows = rowVirtualizer.getVirtualItems()

  return (
    <div ref={scrollElementRef} className="h-full min-h-0 overflow-y-auto">
      <div className="relative w-full" style={{ height: `${rowVirtualizer.getTotalSize()}px` }}>
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
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {rowAssets.map((asset) => (
                <div key={asset.id}>{renderAsset(asset)}</div>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
