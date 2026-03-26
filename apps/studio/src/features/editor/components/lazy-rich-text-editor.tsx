import type { RichTextEditorProps } from '@valguide/ui/components/rich-text/rich-text-editor'
import { RichTextEditorLoadingShell } from '@valguide/ui/components/rich-text/rich-text-editor-loading-shell'
import { lazy, Suspense } from 'react'

const RichTextEditor = lazy(async () => {
  const module = await import('@valguide/ui/components/rich-text/rich-text-editor')
  return { default: module.RichTextEditor }
})

export function LazyRichTextEditor(props: RichTextEditorProps) {
  const { readOnly } = props

  return (
    <Suspense fallback={<RichTextEditorLoadingShell readOnly={readOnly} />}>
      <RichTextEditor {...props} />
    </Suspense>
  )
}
