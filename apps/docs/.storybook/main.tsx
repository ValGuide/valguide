import * as path from 'path'
import { mergeConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  stories: [
    '../src/**/*.stories.@(js|jsx|ts|tsx)',
    '../../web/**/*.stories.@(js|jsx|ts|tsx)',
    '../../../packages/ui/src/**/*.stories.@(js|jsx|ts|tsx)',
  ],

  addons: [
    getAbsolutePath('@storybook/addon-links'),
    getAbsolutePath('@storybook/addon-essentials'),
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
          path.resolve(path.dirname(__dirname), '../web/tsconfig.json'),
          path.resolve(path.dirname(__dirname), '../../packages/core/tsconfig.json'),
          path.resolve(path.dirname(__dirname), '../../packages/ui/tsconfig.json'),
        ],
      }),
    )
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
