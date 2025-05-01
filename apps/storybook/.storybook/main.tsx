import * as path from 'path'
import { mergeConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import type { StorybookConfig } from '@storybook/react-vite'
import { fileURLToPath } from 'url'

const config: StorybookConfig = {
  stories: [
    '../src/**/*.stories.@(js|jsx|ts|tsx)',
    '../../visit/**/*.stories.@(js|jsx|ts|tsx)',
    '../../../packages/core/**/*.stories.@(js|jsx|ts|tsx)',
  ],

  addons: [
    getAbsolutePath('@storybook/addon-links'),
    {
      name: getAbsolutePath('@storybook/addon-essentials'),
      options: {
        docs: false,
      },
    },
    getAbsolutePath('@storybook/addon-themes'),
    getAbsolutePath('storybook-dark-mode'),
    getAbsolutePath('@storybook/addon-interactions'),
    getAbsolutePath('storybook-react-i18next'),
  ],

  typescript: {
    reactDocgen: false,
  },

  framework: getAbsolutePath('@storybook/react-vite'),

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
