import type { Meta, StoryObj } from '@storybook/react'
import { GuideEditSkeleton } from './guide-edit-skeleton'

const meta = {
  title: 'Studio/Pages/Guides/Edit/GuideEditSkeleton',
  component: GuideEditSkeleton,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof GuideEditSkeleton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
