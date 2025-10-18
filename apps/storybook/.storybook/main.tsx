import * as path from 'path'
import { mergeConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import type { StorybookConfig } from '@storybook/nextjs-vite'

const config: StorybookConfig = {
  stories: [
    // '../src/**/*.stories.@(js|jsx|ts|tsx)',
    // '../../visit/**/*.stories.@(js|jsx|ts|tsx)',
    '../../../packages/core/**/*.stories.@(ts|tsx)',
  ],

  addons: [
    getAbsolutePath('@storybook/addon-links'),
    getAbsolutePath('@storybook/addon-themes'),
    getAbsolutePath('storybook-next-intl'),

    // TODO Storybook: enable dark mode (broke in v9)
    // getAbsolutePath('storybook-dark-mode'),
  ],

  typescript: {
    reactDocgen: false,
  },

  framework: getAbsolutePath('@storybook/nextjs-vite'),

  async viteFinal(config) {
    config.plugins?.push(
      /** @see https://github.com/aleclarson/vite-tsconfig-paths */
      tsconfigPaths({
        loose: true,
        projects: [
          path.resolve(path.dirname(__dirname), 'tsconfig.json'),
          path.resolve(path.dirname(__dirname), '../visit/tsconfig.json'),
          path.resolve(path.dirname(__dirname), '../../packages/core/tsconfig.json'),
        ],
      }),
    )

    config.resolve = {
      ...(config.resolve || {}),
      alias: {
        ...(config.resolve?.alias || {}),
        'next/image': path.resolve(__dirname, './__mocks__/NextImageMock.tsx'),
      },
    }
    return mergeConfig(config, {
      define: { 'process.env': '{}' },
      optimizeDeps: {
        // TODO Storybook: enable dark mode (broke in v9)
        include: ['storybook-dark-mode'],
        exclude: ['@storybook/builder-vite'],
      },
    })
  },
}
export default config

function getAbsolutePath(value: string): any {
  return path.dirname(require.resolve(path.join(value, 'package.json')))
}
