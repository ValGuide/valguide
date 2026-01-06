// vite.config.ts
import tailwindcss from '@tailwindcss/vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import Inspect from "vite-plugin-inspect";

export default defineConfig({
  server: {
    port: 3002,
  },
  plugins: [
    // Enables Vite to resolve imports using path aliases
    tsconfigPaths({
      projects: [
        './tsconfig.json',
        '../../packages/core/tsconfig.json'
      ],
    }),
    tailwindcss(),
    // TanStack Start must come BEFORE nitro for proper server function code splitting
    tanstackStart({
      srcDirectory: 'src',
      router: {
        routesDirectory: 'routes',
      },
    }),
    nitro(),
    devtools(),
    viteReact(),
    Inspect(),
  ],
})
