// vite.config.ts
import tailwindcss from '@tailwindcss/vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  server: {
    port: 3002,
  },
  plugins: [
    // Enables Vite to resolve imports using path aliases - must be first
    tsconfigPaths({
      projects: [
        './tsconfig.json',
        '../../packages/core/tsconfig.json'
      ],
    }),
    nitro(),
    devtools(),
    tailwindcss(),
    tanstackStart({
      srcDirectory: 'src', // This is the default
      router: {
        // Specifies the directory TanStack Router uses for your routes.
        routesDirectory: 'routes', // Defaults to "routes", relative to srcDirectory
      },
    }),
    viteReact(),
  ],
})
