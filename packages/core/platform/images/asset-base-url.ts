import { clientEnv } from '../../env/client'

export function getAssetBaseUrl(): string {
  if (clientEnv.VITE_ENV === 'local' && !clientEnv.VITE_ASSET_BASE_URL) {
    return '/api/assets'
  }

  return clientEnv.VITE_ASSET_BASE_URL || clientEnv.VITE_R2_PUBLIC_URL
}
