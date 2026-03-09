import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { RichTextEditorToolbar } from './rich-text-editor-toolbar'
import { SmallText } from './small-text-extension'

export interface RichTextEditorProps {
  'aria-labelledby'?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  readOnly?: boolean
}

export function RichTextEditor({
  'aria-labelledby': ariaLabelledBy,
  value,
  onChange,
  placeholder,
  className,
  readOnly,
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    editable: !readOnly,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4],
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      SmallText,
    ],
    content: value ? parseEditorContent(value) : '',
    onUpdate: ({ editor }) => {
      const json = editor.getJSON()
      onChange(JSON.stringify(json))
    },
    editorProps: {
      attributes: {
        ...(ariaLabelledBy ? { 'aria-labelledby': ariaLabelledBy } : {}),
        class:
          'ProseMirror min-h-[120px] max-w-none rounded-b-md border-x border-b bg-card p-4 text-sm text-foreground caret-foreground focus:outline-none selection:bg-[var(--selection)] selection:text-[var(--selection-foreground)]',
        placeholder: placeholder || '',
      },
    },
  })

  return (
    <div className={className}>
      <div className="overflow-hidden rounded-md border bg-card text-card-foreground">
        <RichTextEditorToolbar editor={editor} disabled={readOnly} />
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

function parseEditorContent(content: string): any {
  if (!content) return ''

  try {
    return JSON.parse(content)
  } catch {
    return {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: content }],
        },
      ],
    }
  }
}
