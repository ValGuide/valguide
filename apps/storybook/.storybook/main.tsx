import { createRequire } from 'node:module'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { StorybookConfig } from '@storybook/nextjs-vite'
import { mergeConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)

const config: StorybookConfig = {
  stories: [
    '../../../apps/!(storybook)/!(node_modules)/**/*.stories.@(ts|tsx)',
    '../../../packages/!(node_modules)/!(node_modules)/**/*.stories.@(ts|tsx)',
  ],

  addons: [
    getAbsolutePath('storybook-next-intl'),
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
      define: {
        'process.env': '{}',
        'process.env.DATABASE_URL': '""',
      },
      optimizeDeps: {
        exclude: ['@storybook/builder-vite'],
      },
      resolve: {
        alias: {
          // Note: @/* paths are resolved by vite-tsconfig-paths based on each app's tsconfig.json
          // Mock TanStack Start to prevent server-side modules from being bundled
          '@tanstack/react-start/server': path.resolve(__dirname, './__mocks__/tanstack-react-start-server.ts'),
          '@tanstack/react-start': path.resolve(__dirname, './__mocks__/tanstack-react-start.ts'),
          // Mock server-side modules for browser compatibility
          postgres: path.resolve(__dirname, './__mocks__/postgres.ts'),
          '@valguide/supabase/server': path.resolve(__dirname, './__mocks__/supabase-server.ts'),
          '@valguide/core/features/assets/actions': path.resolve(__dirname, './__mocks__/asset-actions.ts'),
          '@valguide/core/features/assets/queries': path.resolve(__dirname, './__mocks__/asset-queries.ts'),
          '@valguide/core/features/orgs/actions': path.resolve(__dirname, './__mocks__/org-actions.ts'),
          '@valguide/core/features/guides/actions': path.resolve(__dirname, './__mocks__/guide-actions.ts'),
          '@valguide/core/features/guides/server-functions': path.resolve(
            __dirname,
            './__mocks__/guide-server-functions.ts',
          ),
          '@valguide/core/features/db': path.resolve(__dirname, './__mocks__/db.ts'),
          crypto: path.resolve(__dirname, './__mocks__/crypto.ts'),
        },
      },
    })
  },
}
export default config

function getAbsolutePath(value: string): string {
  return path.dirname(require.resolve(path.join(value, 'package.json')))
}
