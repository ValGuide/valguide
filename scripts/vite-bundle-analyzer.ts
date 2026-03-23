import path from 'node:path'
import { visualizer } from 'rollup-plugin-visualizer'

const analyzeBuild = process.env.ANALYZE === 'true'

export function getBundleAnalyzerPlugin(appName: string): ReturnType<typeof visualizer>[] {
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
