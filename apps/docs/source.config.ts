import { defineConfig, defineDocs, frontmatterSchema } from 'fumadocs-mdx/config'

const publicDocsFiles = [
  '*.md',
  'product/**/*.md',
  'engineering/**/*.md',
  'operations/**/*.md',
  'design/**/*.md',
  'research/*.md',
  'research/experiments/**/*.md',
  'research/reference/*.md',
]

const workspaceDocsSourceDir = process.env.VALGUIDE_DOCS_SOURCE_DIR
const isWorkspaceDocsMode = process.env.VALGUIDE_DOCS_MODE === 'workspace' && workspaceDocsSourceDir

const docsFrontmatterSchema = (({ path }: { path: string }) => ({
  '~standard': {
    version: 1,
    vendor: 'valguide',
    validate(value: unknown) {
      const frontmatter = isRecord(value) ? value : {}

      return {
        value: {
          ...frontmatter,
          title: typeof frontmatter.title === 'string' ? frontmatter.title : titleFromPath(path),
        },
      }
    },
  },
})) as unknown as typeof frontmatterSchema

export const docs = defineDocs({
  dir: isWorkspaceDocsMode ? workspaceDocsSourceDir : '../../docs',
  docs: {
    files: isWorkspaceDocsMode ? ['**/*.md'] : publicDocsFiles,
    schema: docsFrontmatterSchema,
  },
})

export default defineConfig()

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function titleFromPath(path: string) {
  const filename = path.split('/').pop() ?? 'Untitled'
  const name = filename.replace(/\.(md|mdx)$/, '')

  return name
    .split(/[-_]/)
    .filter(Boolean)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(' ')
}
