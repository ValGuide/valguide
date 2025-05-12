import type { Meta, StoryObj } from '@storybook/react'
import { AuthSkeleton } from './auth-skeleton'

const meta = {
  title: 'Auth/AuthSkeleton',
  component: AuthSkeleton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof AuthSkeleton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
