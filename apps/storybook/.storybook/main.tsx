import { createRequire } from 'node:module'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { StorybookConfig } from '@storybook/nextjs-vite'
import { mergeConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { clientEnv } from './__mocks__/env-client.ts'
import { serverEnv } from './__mocks__/env-server.ts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function generateMockEnvDefines() {
  const defines: Record<string, string> = {}
  // Mock client env (import.meta.env.VITE_*)
  for (const [key, value] of Object.entries(clientEnv)) {
    defines[`import.meta.env.${key}`] = JSON.stringify(value)
  }
  // Mock server env (process.env.*)
  for (const [key, value] of Object.entries(serverEnv)) {
    defines[`process.env.${key}`] = JSON.stringify(value)
  }

  defines['process.env'] = JSON.stringify(defines)
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
          path.resolve(path.dirname(__dirname), '../www/tsconfig.json'),
          path.resolve(path.dirname(__dirname), '../admin/tsconfig.json'),
          path.resolve(path.dirname(__dirname), '../links/tsconfig.json'),
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
          // Mock environment variables
          { find: '@valguide/core/env/server', replacement: path.resolve(__dirname, './__mocks__/env-server.ts') },
          { find: '@valguide/core/env/client', replacement: path.resolve(__dirname, './__mocks__/env-client.ts') },
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
          {
            find: '@valguide/core/features/assets/server-functions',
            replacement: path.resolve(__dirname, './__mocks__/asset-server-functions.ts'),
          },
          {
            find: '@valguide/core/features/auth/server-functions',
            replacement: path.resolve(__dirname, './__mocks__/auth-server-functions.ts'),
          },
          {
            find: '@valguide/core/features/orgs/server-functions',
            replacement: path.resolve(__dirname, './__mocks__/orgs-server-functions.ts'),
          },
          {
            find: '@valguide/core/i18n/server-functions',
            replacement: path.resolve(__dirname, './__mocks__/i18n-server-functions.ts'),
          },
          // Studio app server functions (use @/ alias pattern)
          {
            find: /^@\/features\/theme\/server-functions$/,
            replacement: path.resolve(__dirname, './__mocks__/studio-theme-server-functions.ts'),
          },
          {
            find: /^@\/features\/profile\/server-functions$/,
            replacement: path.resolve(__dirname, './__mocks__/studio-profile-server-functions.ts'),
          },
          {
            find: /^@\/features\/profile\/actions$/,
            replacement: path.resolve(__dirname, './__mocks__/studio-profile-actions.ts'),
          },
          {
            find: /^@\/features\/sidebar\/server-functions$/,
            replacement: path.resolve(__dirname, './__mocks__/studio-sidebar-server-functions.ts'),
          },
          {
            find: /^@\/features\/team\/server-functions$/,
            replacement: path.resolve(__dirname, './__mocks__/studio-team-server-functions.ts'),
          },
          {
            find: /^@\/features\/guides\/server-functions$/,
            replacement: path.resolve(__dirname, './__mocks__/studio-guides-server-functions.ts'),
          },
          {
            find: /^@\/features\/assets\/server-functions$/,
            replacement: path.resolve(__dirname, './__mocks__/studio-assets-server-functions.ts'),
          },
          {
            find: /^@\/features\/stops\/server-functions$/,
            replacement: path.resolve(__dirname, './__mocks__/studio-stops-server-functions.ts'),
          },
          {
            find: /^@\/features\/join-team\/server-functions$/,
            replacement: path.resolve(__dirname, './__mocks__/studio-join-team-server-functions.ts'),
          },
          {
            find: /^@\/features\/design\/server-functions$/,
            replacement: path.resolve(__dirname, './__mocks__/studio-design-server-functions.ts'),
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
