import { applyMdxPreset, defineConfig, defineDocs } from 'fumadocs-mdx/config'

export const docs = defineDocs({
  dir: '../../docs',
  docs: {
    mdxOptions: applyMdxPreset({
      format: 'md',
    }),
  },
})

export default defineConfig()
