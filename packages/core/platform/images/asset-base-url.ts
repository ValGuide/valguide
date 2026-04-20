import { clientEnv } from '../../env/client'

export function getAssetBaseUrl(): string {
  return clientEnv.VITE_ASSET_BASE_URL || clientEnv.VITE_R2_PUBLIC_URL
}
