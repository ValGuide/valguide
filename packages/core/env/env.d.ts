/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_POSTHOG_ENABLED: string | undefined
  readonly VITE_POSTHOG_KEY: string | undefined
  readonly VITE_POSTHOG_HOST: string | undefined
  readonly VITE_STUDIO_URL: string | undefined
  readonly VITE_APP_DOMAIN: string | undefined
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
