import path from 'node:path'
import { visualizer } from 'rollup-plugin-visualizer'
import type { PluginOption } from 'vite'

const analyzeBuild = process.env.ANALYZE === 'true'

export function getBundleAnalyzerPlugin(appName: string): PluginOption[] {
  if (!analyzeBuild) {
    return []
  }

  return [
    visualizer({
      filename: path.resolve(process.cwd(), '.output', `${appName}-bundle-analysis.html`),
      gzipSize: true,
      brotliSize: true,
      open: true,
      template: 'treemap',
    }),
  ]
}
