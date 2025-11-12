export function normalizeDescription(description: string | null | undefined): string {
  if (!description) return ''

  const trimmed = description.trim()
  if (!trimmed) return ''

  if (trimmed.startsWith('{')) {
    return trimmed
  }

  return JSON.stringify({
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [{ type: 'text', text: trimmed }],
      },
    ],
  })
}
