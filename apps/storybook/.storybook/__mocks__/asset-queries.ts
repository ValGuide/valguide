// Mock asset queries for Storybook
export async function getAssets(..._args: unknown[]) {
  return []
}

export async function getAssetById(..._args: unknown[]) {
  return null
}

export type GetAssetsFilters = Record<string, unknown>
