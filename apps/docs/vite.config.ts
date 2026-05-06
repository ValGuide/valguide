import { getBundleAnalyzerPlugin } from '../../scripts/vite-bundle-analyzer'
import react from '@vitejs/plugin-react'
import { cloudflare } from '@cloudflare/vite-plugin'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { defineConfig, searchForWorkspaceRoot } from 'vite'
import tsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import mdx from 'fumadocs-mdx/vite'

const workspaceRoot = process.env.VALGUIDE_WORKSPACE_ROOT
const fsAllow = workspaceRoot ? [searchForWorkspaceRoot(process.cwd()), workspaceRoot] : undefined

export default defineConfig(async ({ command }) => ({
  define: {
    'import.meta.env.VALGUIDE_DOCS_MODE': JSON.stringify(process.env.VALGUIDE_DOCS_MODE ?? ''),
  },
  server: {
    port: 3006,
    allowedHosts: ['docs.local.dev'],
    ...(fsAllow && {
      fs: {
        allow: fsAllow,
      },
    }),
  },
  plugins: [
    mdx(await import('./source.config')),
    tailwindcss(),
    tsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    cloudflare({
      viteEnvironment: { name: 'ssr' },
      inspectorPort: 9236,
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
    ...getBundleAnalyzerPlugin('docs'),
  ],
}))
