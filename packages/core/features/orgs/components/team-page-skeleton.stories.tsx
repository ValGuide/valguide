import type { Meta, StoryObj } from '@storybook/react'
import { TeamPageSkeleton } from './team-page-skeleton'

const meta: Meta<typeof TeamPageSkeleton> = {
  title: 'Features/Orgs/TeamPageSkeleton',
  component: TeamPageSkeleton,
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof TeamPageSkeleton>

export const Default: Story = {}
