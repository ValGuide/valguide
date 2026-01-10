import type { StorybookConfig } from '@storybook/nextjs-vite'
import { clientEnvSchema } from '@valguide/core/env/schema'
import { createRequire } from 'node:module'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import { mergeConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function generateMockEnvDefines() {
  const defines: Record<string, string> = {}
  for (const key of Object.keys(clientEnvSchema.shape)) {
    defines[`import.meta.env.${key}`] = '""'
  }
  return defines
}
const require = createRequire(import.meta.url)

const config: StorybookConfig = {
  stories: [
    '../../../apps/!(storybook)/!(node_modules)/**/*.stories.@(ts|tsx)',
    '../../../packages/!(node_modules)/!(node_modules)/**/*.stories.@(ts|tsx)',
  ],

  addons: [
    // TODO Storybook: enable dark mode (broke in v9)
    // getAbsolutePath('storybook-dark-mode'),
  ],

  typescript: {
    reactDocgen: false,
  },

  framework: getAbsolutePath('@storybook/nextjs-vite'),

  core: {
    disableTelemetry: true,
  },

  async viteFinal(config) {
    config.plugins?.push(
      /** @see https://github.com/aleclarson/vite-tsconfig-paths */
      tsconfigPaths({
        loose: true,
        projects: [
          path.resolve(path.dirname(__dirname), 'tsconfig.json'),
          path.resolve(path.dirname(__dirname), '../app/tsconfig.json'),
          path.resolve(path.dirname(__dirname), '../studio/tsconfig.json'),
          path.resolve(path.dirname(__dirname), '../../packages/core/tsconfig.json'),
        ],
      }),
    )

    return mergeConfig(config, {
      define: generateMockEnvDefines(),
      optimizeDeps: {
        exclude: ['@storybook/builder-vite'],
      },
      resolve: {
        alias: [
          // Note: @/* paths are resolved by vite-tsconfig-paths based on each app's tsconfig.json
          // Mock TanStack Start to prevent server-side modules from being bundled
          {
            find: '@tanstack/react-start/server',
            replacement: path.resolve(__dirname, './__mocks__/tanstack-react-start-server.ts'),
          },
          {
            find: '@tanstack/react-start',
            replacement: path.resolve(__dirname, './__mocks__/tanstack-react-start.ts'),
          },
          // Mock server-side modules for browser compatibility
          { find: 'postgres', replacement: path.resolve(__dirname, './__mocks__/postgres.ts') },
          { find: '@valguide/supabase/server', replacement: path.resolve(__dirname, './__mocks__/supabase-server.ts') },
          {
            find: '@valguide/core/features/assets/actions',
            replacement: path.resolve(__dirname, './__mocks__/asset-actions.ts'),
          },
          {
            find: '@valguide/core/features/assets/queries',
            replacement: path.resolve(__dirname, './__mocks__/asset-queries.ts'),
          },
          {
            find: '@valguide/core/features/orgs/actions',
            replacement: path.resolve(__dirname, './__mocks__/org-actions.ts'),
          },
          {
            find: '@valguide/core/features/guides/actions',
            replacement: path.resolve(__dirname, './__mocks__/guide-actions.ts'),
          },
          {
            find: '@valguide/core/features/guides/server-functions',
            replacement: path.resolve(__dirname, './__mocks__/guide-server-functions.ts'),
          },
          { find: '@valguide/core/features/db', replacement: path.resolve(__dirname, './__mocks__/db.ts') },
          // Mock drizzle to prevent DB connections
          {
            find: 'drizzle-orm/postgres-js',
            replacement: path.resolve(__dirname, './__mocks__/drizzle-orm-postgres.ts'),
          },
          { find: 'crypto', replacement: path.resolve(__dirname, './__mocks__/crypto.ts') },
        ],
      },
    })
  },
}
export default config

function getAbsolutePath(value: string): string {
  return path.dirname(require.resolve(path.join(value, 'package.json')))
}
