import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { RichTextEditor } from './rich-text-editor'

const meta: Meta<typeof RichTextEditor> = {
  title: 'Tours/RichTextEditor',
  component: RichTextEditor,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof RichTextEditor>

function RichTextEditorWrapper({ initialValue = '' }: { initialValue?: string }) {
  const [value, setValue] = useState(initialValue)

  return (
    <div className="max-w-3xl">
      <RichTextEditor value={value} onChange={setValue} placeholder="Start typing..." />
      <div className="mt-4 p-4 bg-muted rounded-md">
        <p className="text-sm font-medium mb-2">JSON Output:</p>
        <pre className="text-xs overflow-auto">{value || '(empty)'}</pre>
      </div>
    </div>
  )
}

export const Empty: Story = {
  render: () => <RichTextEditorWrapper />,
}

export const WithPlainText: Story = {
  render: () => (
    <RichTextEditorWrapper
      initialValue={JSON.stringify({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'This is a simple paragraph of text.' }],
          },
        ],
      })}
    />
  ),
}

export const WithFormatting: Story = {
  render: () => (
    <RichTextEditorWrapper
      initialValue={JSON.stringify({
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
      })}
    />
  ),
}

export const WithHeading: Story = {
  render: () => (
    <RichTextEditorWrapper
      initialValue={JSON.stringify({
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
      })}
    />
  ),
}

export const WithAllHeadingLevels: Story = {
  render: () => (
    <RichTextEditorWrapper
      initialValue={JSON.stringify({
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 1 },
            content: [{ type: 'text', text: 'Heading 1 — Exhibition Title' }],
          },
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: 'Heading 2 — Section' }],
          },
          {
            type: 'heading',
            attrs: { level: 3 },
            content: [{ type: 'text', text: 'Heading 3 — Subsection' }],
          },
          {
            type: 'heading',
            attrs: { level: 4 },
            content: [{ type: 'text', text: 'Heading 4 — Detail' }],
          },
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Regular paragraph text for comparison.' }],
          },
        ],
      })}
    />
  ),
}

export const WithSmallText: Story = {
  render: () => (
    <RichTextEditorWrapper
      initialValue={JSON.stringify({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'This exhibit was donated in 1923. ' },
              {
                type: 'text',
                marks: [{ type: 'small' }],
                text: 'Source: Museum Archives, Ref. #4821',
              },
            ],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                marks: [{ type: 'small' }],
                text: 'Photography is not permitted in this gallery.',
              },
            ],
          },
        ],
      })}
    />
  ),
}

export const WithLists: Story = {
  render: () => (
    <RichTextEditorWrapper
      initialValue={JSON.stringify({
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
      })}
    />
  ),
}

export const WithBlockquote: Story = {
  render: () => (
    <RichTextEditorWrapper
      initialValue={JSON.stringify({
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
      })}
    />
  ),
}

export const ComplexContent: Story = {
  render: () => (
    <RichTextEditorWrapper
      initialValue={JSON.stringify({
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
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                marks: [{ type: 'small' }],
                text: 'Last updated: January 2026. All rights reserved.',
              },
            ],
          },
        ],
      })}
    />
  ),
}
