import { Mark, mergeAttributes } from '@tiptap/core'

export const SmallText = Mark.create({
  name: 'small',
  parseHTML() {
    return [{ tag: 'small' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['small', mergeAttributes(HTMLAttributes), 0]
  },
})
