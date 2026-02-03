import type { Meta, StoryObj } from '@storybook/react'
import { RichTextDisplay } from './rich-text-display'

const meta: Meta<typeof RichTextDisplay> = {
  title: 'Tours/RichTextDisplay',
  component: RichTextDisplay,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof RichTextDisplay>

export const Empty: Story = {
  args: {
    content: '',
  },
}

export const PlainText: Story = {
  args: {
    content: JSON.stringify({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'This is a simple paragraph of text.' }],
        },
      ],
    }),
  },
}

export const WithFormatting: Story = {
  args: {
    content: JSON.stringify({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'This is ' },
            { type: 'text', marks: [{ type: 'bold' }], text: 'bold' },
            { type: 'text', text: ', ' },
            { type: 'text', marks: [{ type: 'italic' }], text: 'italic' },
            { type: 'text', text: ', and ' },
            { type: 'text', marks: [{ type: 'strike' }], text: 'strikethrough' },
            { type: 'text', text: ' text.' },
          ],
        },
      ],
    }),
  },
}

export const WithHeading: Story = {
  args: {
    content: JSON.stringify({
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Welcome to ValGuide' }],
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Create engaging multimedia guides for your museum or institution.' }],
        },
      ],
    }),
  },
}

export const WithBulletList: Story = {
  args: {
    content: JSON.stringify({
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Features' }],
        },
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Rich text formatting' }],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Multimedia support' }],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Multi-language content' }],
                },
              ],
            },
          ],
        },
      ],
    }),
  },
}

export const WithOrderedList: Story = {
  args: {
    content: JSON.stringify({
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Steps' }],
        },
        {
          type: 'orderedList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'First step' }],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Second step' }],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Third step' }],
                },
              ],
            },
          ],
        },
      ],
    }),
  },
}

export const WithBlockquote: Story = {
  args: {
    content: JSON.stringify({
      type: 'doc',
      content: [
        {
          type: 'blockquote',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'The best way to learn about history is through interactive, engaging guides.',
                },
              ],
            },
          ],
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: '— Museum Director' }],
        },
      ],
    }),
  },
}

export const ComplexContent: Story = {
  args: {
    content: JSON.stringify({
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'About the Exhibition' }],
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Discover the ' },
            { type: 'text', marks: [{ type: 'bold' }], text: 'Ancient World' },
            { type: 'text', text: ' through this ' },
            { type: 'text', marks: [{ type: 'italic' }], text: 'immersive' },
            { type: 'text', text: ' multimedia guide.' },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 3 },
          content: [{ type: 'text', text: 'What to expect:' }],
        },
        {
          type: 'orderedList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Audio narration for each exhibit' }],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'High-resolution images and videos' }],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Interactive maps and timelines' }],
                },
              ],
            },
          ],
        },
        {
          type: 'blockquote',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'A journey through time and space, brought to life with modern technology.' },
              ],
            },
          ],
        },
      ],
    }),
  },
}

export const WithLineClamp: Story = {
  args: {
    content: JSON.stringify({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'This is a very long paragraph that should be clamped to 3 lines. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
            },
          ],
        },
      ],
    }),
    className: 'line-clamp-3',
  },
}

export const LegacyPlainText: Story = {
  args: {
    content: 'This is legacy plain text that should still render correctly.',
  },
}
