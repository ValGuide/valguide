import { getRemoteDevConfigPath } from '../../scripts/wrangler-remote-bindings'
import tailwindcss from '@tailwindcss/vite'
import { cloudflare } from '@cloudflare/vite-plugin'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig(() => ({
  server: {
    port: 3000,
    allowedHosts: ['app.local.dev'],
  },
  plugins: [
    tsconfigPaths({
      projects: [
        './tsconfig.json',
        '../../packages/core/tsconfig.json'
      ],
    }),
    tailwindcss(),
    cloudflare({
      viteEnvironment: { name: 'ssr' },
      inspectorPort: 9230,
      ...(process.env.WRANGLER_REMOTE === 'true' && {
        configPath: getRemoteDevConfigPath(),
      }),
      config: {
        vars: Object.fromEntries(
          Object.entries(process.env)
            .filter((entry): entry is [string, string] => entry[1] !== undefined)
        ),
      },
    }),
    tanstackStart({
      spa: {
        enabled: true,
      },
      srcDirectory: 'src',
      router: {
        routesDirectory: 'routes',
      },
    }),
    devtools(),
    viteReact(),
  ],
}))
