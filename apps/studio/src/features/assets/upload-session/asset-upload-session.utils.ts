import type { AssetType } from '@valguide/core/features/assets/types'

export type AssetUploadStatus = 'queued' | 'uploading' | 'confirming' | 'complete' | 'error'

export type AssetUploadListItem = {
  status: AssetUploadStatus
  progress: number
  type: AssetType
}

export function isFileDrag(types: Iterable<string> | null | undefined): boolean {
  if (!types) {
    return false
  }

  for (const type of types) {
    if (type === 'Files') {
      return true
    }
  }

  return false
}

export function isTerminalUploadStatus(status: AssetUploadStatus): boolean {
  return status === 'complete' || status === 'error'
}

export function getAggregateUploadProgress(items: AssetUploadListItem[]): number {
  if (items.length === 0) {
    return 0
  }

  const totalProgress = items.reduce((sum, item) => {
    if (item.status === 'complete') {
      return sum + 100
    }

    if (item.status === 'confirming') {
      return sum + 100
    }

    return sum + Math.max(0, Math.min(100, item.progress))
  }, 0)

  return Math.round(totalProgress / items.length)
}

export function getUploadCounts(items: AssetUploadListItem[]) {
  return items.reduce(
    (counts, item) => {
      counts.total += 1

      if (item.status === 'complete') {
        counts.complete += 1
      } else if (item.status === 'error') {
        counts.error += 1
      } else if (item.status === 'queued') {
        counts.queued += 1
      } else {
        counts.active += 1
      }

      return counts
    },
    {
      total: 0,
      active: 0,
      queued: 0,
      complete: 0,
      error: 0,
    },
  )
}
