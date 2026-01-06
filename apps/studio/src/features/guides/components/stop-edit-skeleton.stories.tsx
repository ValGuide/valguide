import type { Meta, StoryObj } from '@storybook/react'
import { StopEditSkeleton } from './stop-edit-skeleton'

const meta = {
  title: 'Studio/Pages/Guides/Edit/StopEditSkeleton',
  component: StopEditSkeleton,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof StopEditSkeleton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
