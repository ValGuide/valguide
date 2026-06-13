import type { Meta, StoryObj } from '@storybook/react'
import { TourEditSkeleton } from './tour-edit-skeleton'

const meta = {
  title: 'Studio/Tours/Pages/Edit/TourEditSkeleton',
  component: TourEditSkeleton,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof TourEditSkeleton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
