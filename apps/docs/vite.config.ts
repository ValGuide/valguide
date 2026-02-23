import react from '@vitejs/plugin-react'
import { cloudflare } from '@cloudflare/vite-plugin'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { defineConfig } from 'vite'
import tsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import mdx from 'fumadocs-mdx/vite'

export default defineConfig(async ({ command }) => ({
  server: {
    port: 3006,
    allowedHosts: ['docs.local.dev'],
  },
  plugins: [
    mdx(await import('./source.config')),
    tailwindcss(),
    tsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    cloudflare({
      viteEnvironment: { name: 'ssr' },
      ...(command === 'serve' && {
        config: {
          vars: Object.fromEntries(
            Object.entries(process.env)
              .filter((entry): entry is [string, string] => entry[1] !== undefined)
          ),
        },
      }),
    }),
    tanstackStart({
      prerender: {
        enabled: false,
      },
    }),
    react(),
  ],
}))
