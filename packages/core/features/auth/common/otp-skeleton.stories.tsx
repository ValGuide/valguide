import type { Meta, StoryObj } from '@storybook/react-vite'
import { OtpSkeleton } from './otp-skeleton'

const meta = {
  title: 'Auth/OtpSkeleton',
  component: OtpSkeleton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof OtpSkeleton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
