/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_POSTHOG_ENABLED: string | undefined
  readonly VITE_POSTHOG_KEY: string | undefined
  readonly VITE_POSTHOG_HOST: string | undefined
  readonly VITE_PRIVACY_POLICY_URL: string | undefined
  readonly VITE_STUDIO_URL: string | undefined
  readonly VITE_TERMS_OF_SERVICE_URL: string | undefined
  readonly VITE_APP_DOMAIN: string | undefined
  readonly VITE_ASSET_BASE_URL: string | undefined
  readonly VITE_IMAGEKIT_URL: string | undefined
  readonly VITE_IMAGE_DELIVERY_PROVIDER: 'cloudflare' | 'imagekit' | 'origin' | undefined
  readonly VITE_IMAGE_PROVIDER: 'cloudflare' | 'imagekit' | undefined
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
