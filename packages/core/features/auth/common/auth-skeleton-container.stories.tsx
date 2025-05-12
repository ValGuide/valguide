import type { Meta, StoryObj } from '@storybook/react'
import { AuthSkeletonContainer } from './auth-skeleton-container'

const meta = {
  title: 'Auth/AuthSkeletonContainer',
  component: AuthSkeletonContainer,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof AuthSkeletonContainer>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithOtp: Story = {
  args: {
    showOtp: true,
  },
}
