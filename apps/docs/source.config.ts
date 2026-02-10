import { defineConfig, defineDocs } from 'fumadocs-mdx/config'

export const docs = defineDocs({
  dir: '../../docs',
  docs: {
    files: ['*.md', '{architecture,features,patterns,plans,tour-stop-asset,ux}/**/*.md'],
  },
})

export default defineConfig()
