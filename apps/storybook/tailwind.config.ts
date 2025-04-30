// tailwind config is required for editor support

import type { Config } from 'tailwindcss'
import sharedConfig from '@valguide/core/ui/tailwind.config'

const config: Pick<Config, 'content' | 'presets'> = {
  content: [
    '../../packages/**/*.{js,ts,jsx,tsx}',
    '!../../packages/**/node_modules/**/*',
    '../../apps/web/**/*.{js,ts,jsx,tsx}',
    '!../../apps/web/node_modules/**/*',
  ],
  presets: [sharedConfig],
}

export default config
