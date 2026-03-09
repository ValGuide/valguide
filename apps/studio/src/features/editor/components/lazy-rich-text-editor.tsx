import type { RichTextEditorProps } from '@valguide/ui/components/rich-text/rich-text-editor'
import { Textarea } from '@valguide/ui/components/textarea'
import { lazy, Suspense } from 'react'

const RichTextEditor = lazy(async () => {
  const module = await import('@valguide/ui/components/rich-text/rich-text-editor')
  return { default: module.RichTextEditor }
})

export function LazyRichTextEditor(props: RichTextEditorProps) {
  const { value, placeholder, readOnly } = props

  return (
    <Suspense
      fallback={
        <Textarea value={value} placeholder={placeholder} disabled={readOnly} readOnly className="min-h-[154px]" />
      }
    >
      <RichTextEditor {...props} />
    </Suspense>
  )
}
