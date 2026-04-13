import type { Editor } from '@tiptap/react'
import { useEditorState } from '@tiptap/react'
import { useTranslations } from '@valguide/core/i18n/client'
import { Button } from '@valguide/core/ui/components/button'
import { Separator } from '@valguide/core/ui/components/separator'
import {
  ALargeSmall,
  Bold,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Italic,
  List,
  ListOrdered,
  Quote,
  Redo,
  Strikethrough,
  Undo,
} from 'lucide-react'
import { captureStudioClientEvent } from '../../../posthog/PostHogProvider'

export interface EditorToolbarProps {
  editor: Editor | null
  disabled?: boolean
}

export function RichTextEditorToolbar({ editor, disabled }: EditorToolbarProps) {
  const t = useTranslations('richTextEditor')

  const captureFormat = (format: string) => {
    captureStudioClientEvent('editor.format_applied', { format })
  }

  const editorState = useEditorState({
    editor,
    selector: (snapshot) => ({
      isBold: snapshot.editor?.isActive('bold') ?? false,
      isItalic: snapshot.editor?.isActive('italic') ?? false,
      isStrike: snapshot.editor?.isActive('strike') ?? false,
      isHeading1: snapshot.editor?.isActive('heading', { level: 1 }) ?? false,
      isHeading2: snapshot.editor?.isActive('heading', { level: 2 }) ?? false,
      isHeading3: snapshot.editor?.isActive('heading', { level: 3 }) ?? false,
      isHeading4: snapshot.editor?.isActive('heading', { level: 4 }) ?? false,
      isSmall: snapshot.editor?.isActive('small') ?? false,
      isBulletList: snapshot.editor?.isActive('bulletList') ?? false,
      isOrderedList: snapshot.editor?.isActive('orderedList') ?? false,
      isBlockquote: snapshot.editor?.isActive('blockquote') ?? false,
      canBold: snapshot.editor?.can().chain().focus().toggleBold().run() ?? false,
      canItalic: snapshot.editor?.can().chain().focus().toggleItalic().run() ?? false,
      canStrike: snapshot.editor?.can().chain().focus().toggleStrike().run() ?? false,
      canHeading1: snapshot.editor?.can().chain().focus().toggleHeading({ level: 1 }).run() ?? false,
      canHeading2: snapshot.editor?.can().chain().focus().toggleHeading({ level: 2 }).run() ?? false,
      canHeading3: snapshot.editor?.can().chain().focus().toggleHeading({ level: 3 }).run() ?? false,
      canHeading4: snapshot.editor?.can().chain().focus().toggleHeading({ level: 4 }).run() ?? false,
      canSmall: snapshot.editor?.can().chain().focus().toggleMark('small').run() ?? false,
      canBulletList: snapshot.editor?.can().chain().focus().toggleBulletList().run() ?? false,
      canOrderedList: snapshot.editor?.can().chain().focus().toggleOrderedList().run() ?? false,
      canBlockquote: snapshot.editor?.can().chain().focus().toggleBlockquote().run() ?? false,
      canUndo: snapshot.editor?.can().chain().focus().undo().run() ?? false,
      canRedo: snapshot.editor?.can().chain().focus().redo().run() ?? false,
    }),
  })

  if (!editor || !editorState) return null

  return (
    <div
      className={`flex flex-wrap items-center gap-1 border-b bg-muted/30 p-2 text-foreground ${disabled ? 'opacity-50' : ''}`}
    >
      <Button
        type="button"
        variant={editorState.isBold ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => {
          editor.chain().focus().toggleBold().run()
          captureFormat('bold')
        }}
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
        onClick={() => {
          editor.chain().focus().toggleItalic().run()
          captureFormat('italic')
        }}
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
        onClick={() => {
          editor.chain().focus().toggleStrike().run()
          captureFormat('strikethrough')
        }}
        disabled={disabled || !editorState.canStrike}
        aria-label={t('strikethrough')}
        title={t('strikethrough')}
      >
        <Strikethrough className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <Button
        type="button"
        variant={editorState.isHeading1 ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => {
          editor.chain().focus().toggleHeading({ level: 1 }).run()
          captureFormat('heading_1')
        }}
        disabled={disabled || !editorState.canHeading1}
        aria-label={t('heading1')}
        title={t('heading1')}
      >
        <Heading1 className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant={editorState.isHeading2 ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => {
          editor.chain().focus().toggleHeading({ level: 2 }).run()
          captureFormat('heading_2')
        }}
        disabled={disabled || !editorState.canHeading2}
        aria-label={t('heading2')}
        title={t('heading2')}
      >
        <Heading2 className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant={editorState.isHeading3 ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => {
          editor.chain().focus().toggleHeading({ level: 3 }).run()
          captureFormat('heading_3')
        }}
        disabled={disabled || !editorState.canHeading3}
        aria-label={t('heading3')}
        title={t('heading3')}
      >
        <Heading3 className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant={editorState.isHeading4 ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => {
          editor.chain().focus().toggleHeading({ level: 4 }).run()
          captureFormat('heading_4')
        }}
        disabled={disabled || !editorState.canHeading4}
        aria-label={t('heading4')}
        title={t('heading4')}
      >
        <Heading4 className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant={editorState.isSmall ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => {
          editor.chain().focus().toggleMark('small').run()
          captureFormat('small_text')
        }}
        disabled={disabled || !editorState.canSmall}
        aria-label={t('smallText')}
        title={t('smallText')}
      >
        <ALargeSmall className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <Button
        type="button"
        variant={editorState.isBulletList ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => {
          editor.chain().focus().toggleBulletList().run()
          captureFormat('bullet_list')
        }}
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
        onClick={() => {
          editor.chain().focus().toggleOrderedList().run()
          captureFormat('ordered_list')
        }}
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
        onClick={() => {
          editor.chain().focus().toggleBlockquote().run()
          captureFormat('blockquote')
        }}
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
        onClick={() => {
          editor.chain().focus().undo().run()
          captureStudioClientEvent('editor.undo')
        }}
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
        onClick={() => {
          editor.chain().focus().redo().run()
          captureStudioClientEvent('editor.redo')
        }}
        disabled={disabled || !editorState.canRedo}
        aria-label={t('redo')}
        title={t('redo')}
      >
        <Redo className="h-4 w-4" />
      </Button>
    </div>
  )
}
