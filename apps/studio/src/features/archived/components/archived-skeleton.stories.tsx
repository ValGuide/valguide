import type { Meta, StoryObj } from '@storybook/react'
import { ArchivedSkeleton } from './archived-skeleton'

const meta = {
  title: 'Studio/Pages/Archived/Skeleton',
  component: ArchivedSkeleton,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof ArchivedSkeleton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
