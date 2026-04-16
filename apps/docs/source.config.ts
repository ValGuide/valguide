import { defineConfig, defineDocs } from 'fumadocs-mdx/config'

export const docs = defineDocs({
  dir: '../../docs',
  docs: {
    files: [
      '*.md',
      'product/**/*.md',
      'engineering/**/*.md',
      'operations/**/*.md',
      'design/**/*.md',
      'research/*.md',
      'research/experiments/**/*.md',
      'research/reference/*.md',
    ],
  },
})

export default defineConfig()
