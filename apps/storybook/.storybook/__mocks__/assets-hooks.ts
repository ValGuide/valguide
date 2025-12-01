// Mock for @/features/assets/hooks/use-assets

export function useAssets() {
  return {
    assets: [],
    error: undefined,
    isLoading: false,
    refetch: async () => undefined,
  }
}
