type TipTapNode = {
  type: string
  content?: TipTapNode[]
  text?: string
}

const BLOCK_TYPES = new Set([
  'paragraph',
  'heading',
  'blockquote',
  'listItem',
  'codeBlock',
  'bulletList',
  'orderedList',
])

export function extractTextFromRichText(value: string | null): string {
  if (!value) return ''

  try {
    const doc: TipTapNode = JSON.parse(value)
    return extractNodeText(doc).trim()
  } catch {
    return value
  }
}

function extractNodeText(node: TipTapNode): string {
  if (node.text) return node.text

  if (node.type === 'hardBreak') return '\n'

  if (node.type === 'horizontalRule') return '\n---\n'

  if (!node.content) return ''

  const parts: string[] = []
  for (const child of node.content) {
    parts.push(extractNodeText(child))
  }

  const joined = parts.join('')

  if (BLOCK_TYPES.has(node.type)) {
    return `${joined}\n`
  }

  return joined
}
