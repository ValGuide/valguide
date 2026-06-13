import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { FeedbackDialog } from './feedback-dialog'

const meta = {
  title: 'Studio/Feedback/FeedbackDialog',
  component: FeedbackDialog,
  parameters: {
    layout: 'centered',
  },
  args: {
    open: true,
    onOpenChange: fn(),
    onSubmit: fn(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }),
    onClearUploadError: fn(),
  },
} satisfies Meta<typeof FeedbackDialog>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Loading: Story = {
  args: {
    isLoading: true,
  },
}

export const Uploading: Story = {
  name: 'Uploading Screenshot',
  args: {
    isLoading: true,
    uploadProgress: 45,
  },
}

export const UploadError: Story = {
  args: {
    uploadError: 'Upload failed. Please check your connection and try again.',
  },
}

export const Closed: Story = {
  args: {
    open: false,
  },
}
