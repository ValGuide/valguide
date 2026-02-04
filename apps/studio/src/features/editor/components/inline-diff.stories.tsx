import type { Meta, StoryObj } from '@storybook/react'
import { InlineDiff } from './inline-diff'

const meta: Meta<typeof InlineDiff> = {
  title: 'Editor/InlineDiff',
  component: InlineDiff,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="max-w-md rounded border p-4">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof InlineDiff>

export const WordChange: Story = {
  args: {
    oldText: 'Welcome to the museum tour',
    newText: 'Welcome to the gallery tour',
  },
}

export const Addition: Story = {
  args: {
    oldText: 'Welcome to the tour',
    newText: 'Welcome to the guided audio tour',
  },
}

export const Deletion: Story = {
  args: {
    oldText: 'Welcome to the guided audio tour',
    newText: 'Welcome to the tour',
  },
}

export const MultipleChanges: Story = {
  args: {
    oldText: 'This is the original text with some words.',
    newText: 'This is the updated text with different words.',
  },
}

export const NewContent: Story = {
  args: {
    oldText: null,
    newText: 'This is entirely new content',
  },
}

export const NoChanges: Story = {
  args: {
    oldText: 'Same text',
    newText: 'Same text',
  },
}

export const LongParagraph: Story = {
  args: {
    oldText:
      'The Mona Lisa is a half-length portrait painting by Italian artist Leonardo da Vinci. Considered an archetypal masterpiece of the Italian Renaissance, it has been described as the best known, most visited, most written about, and most parodied work of art in the world.',
    newText:
      'The Mona Lisa is a famous half-length portrait by Leonardo da Vinci. Widely regarded as the quintessential masterpiece of the Italian Renaissance, it has been described as the most recognized, most visited, most written about, and most parodied artwork in the world.',
  },
}
