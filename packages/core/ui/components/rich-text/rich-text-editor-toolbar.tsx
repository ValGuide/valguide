import type { Editor } from '@tiptap/react'
import { useEditorState } from '@tiptap/react'
import { useTranslations } from '@valguide/core/i18n/client'
import { Button } from '@valguide/core/ui/components/button'
import { Separator } from '@valguide/core/ui/components/separator'
import { Bold, Heading2, Italic, List, ListOrdered, Quote, Redo, Strikethrough, Undo } from 'lucide-react'

export interface EditorToolbarProps {
  editor: Editor | null
  disabled?: boolean
}

export function RichTextEditorToolbar({ editor, disabled }: EditorToolbarProps) {
  const t = useTranslations('richTextEditor')

  const editorState = useEditorState({
    editor,
    selector: (snapshot) => ({
      isBold: snapshot.editor?.isActive('bold') ?? false,
      isItalic: snapshot.editor?.isActive('italic') ?? false,
      isStrike: snapshot.editor?.isActive('strike') ?? false,
      isHeading2: snapshot.editor?.isActive('heading', { level: 2 }) ?? false,
      isBulletList: snapshot.editor?.isActive('bulletList') ?? false,
      isOrderedList: snapshot.editor?.isActive('orderedList') ?? false,
      isBlockquote: snapshot.editor?.isActive('blockquote') ?? false,
      canBold: snapshot.editor?.can().chain().focus().toggleBold().run() ?? false,
      canItalic: snapshot.editor?.can().chain().focus().toggleItalic().run() ?? false,
      canStrike: snapshot.editor?.can().chain().focus().toggleStrike().run() ?? false,
      canHeading2: snapshot.editor?.can().chain().focus().toggleHeading({ level: 2 }).run() ?? false,
      canBulletList: snapshot.editor?.can().chain().focus().toggleBulletList().run() ?? false,
      canOrderedList: snapshot.editor?.can().chain().focus().toggleOrderedList().run() ?? false,
      canBlockquote: snapshot.editor?.can().chain().focus().toggleBlockquote().run() ?? false,
      canUndo: snapshot.editor?.can().chain().focus().undo().run() ?? false,
      canRedo: snapshot.editor?.can().chain().focus().redo().run() ?? false,
    }),
  })

  if (!editor || !editorState) return null

  return (
    <div className={`flex flex-wrap items-center gap-1 border-b p-2 ${disabled ? 'opacity-50' : ''}`}>
      <Button
        type="button"
        variant={editorState.isBold ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={disabled || !editorState.canBold}
        aria-label={t('bold')}
        title={t('bold')}
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant={editorState.isItalic ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={disabled || !editorState.canItalic}
        aria-label={t('italic')}
        title={t('italic')}
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant={editorState.isStrike ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={disabled || !editorState.canStrike}
        aria-label={t('strikethrough')}
        title={t('strikethrough')}
      >
        <Strikethrough className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <Button
        type="button"
        variant={editorState.isHeading2 ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        disabled={disabled || !editorState.canHeading2}
        aria-label={t('heading')}
        title={t('heading')}
      >
        <Heading2 className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <Button
        type="button"
        variant={editorState.isBulletList ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        disabled={disabled || !editorState.canBulletList}
        aria-label={t('bulletList')}
        title={t('bulletList')}
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant={editorState.isOrderedList ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        disabled={disabled || !editorState.canOrderedList}
        aria-label={t('orderedList')}
        title={t('orderedList')}
      >
        <ListOrdered className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <Button
        type="button"
        variant={editorState.isBlockquote ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        disabled={disabled || !editorState.canBlockquote}
        aria-label={t('blockquote')}
        title={t('blockquote')}
      >
        <Quote className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={disabled || !editorState.canUndo}
        aria-label={t('undo')}
        title={t('undo')}
      >
        <Undo className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={disabled || !editorState.canRedo}
        aria-label={t('redo')}
        title={t('redo')}
      >
        <Redo className="h-4 w-4" />
      </Button>
    </div>
  )
}
