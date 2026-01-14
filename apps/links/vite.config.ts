import tailwindcss from '@tailwindcss/vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import Inspect from 'vite-plugin-inspect'

export default defineConfig({
  server: {
    port: 3003,
    allowedHosts: ['links.local.dev'],
  },
  ssr: {
    // required because resend uses uuid v9 which caused
    // The requested module 'uuid' does not provide an export named 'default'
    noExternal: ["uuid", 'posthog-js', '@posthog/react'],
  },
  optimizeDeps: {
    // required because resend uses uuid v9 which caused
    // The requested module 'uuid' does not provide an export named 'default'
    include: ["uuid"],
  },
  plugins: [
    tsconfigPaths({
      projects: ['./tsconfig.json', '../../packages/core/tsconfig.json'],
    }),
    tailwindcss(),
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
