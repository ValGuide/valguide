type VersionedTranslation = {
  currentVersion?: { title?: string | null; description?: string | null; transcription?: string | null } | null
  draftVersion?: { title?: string | null; description?: string | null; transcription?: string | null } | null
}

export function getVersionedField<T extends VersionedTranslation, K extends 'title' | 'description' | 'transcription'>(
  translation: T | undefined | null,
  field: K,
  preferDraft = false,
): string {
  if (!translation) return ''
  const { currentVersion, draftVersion } = translation
  if (preferDraft) {
    return draftVersion?.[field] ?? currentVersion?.[field] ?? ''
  }
  return currentVersion?.[field] ?? draftVersion?.[field] ?? ''
}

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
