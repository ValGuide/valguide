import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { ScreenshotInput } from './screenshot-input'

const meta = {
  title: 'Features/Feedback/ScreenshotInput',
  component: ScreenshotInput,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Story />
      </div>
    ),
  ],
  args: {
    onFileSelect: fn(),
    onClearError: fn(),
  },
} satisfies Meta<typeof ScreenshotInput>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
}

export const Uploading: Story = {
  args: {
    isUploading: true,
    uploadProgress: 45,
  },
}

export const UploadProgress75: Story = {
  name: 'Upload Progress 75%',
  args: {
    isUploading: true,
    uploadProgress: 75,
  },
}

export const UploadComplete: Story = {
  args: {
    isUploading: false,
    uploadProgress: 100,
  },
}

export const UploadError: Story = {
  args: {
    uploadError: 'Upload failed. Please check your connection and try again.',
  },
}

export const UploadTimeoutError: Story = {
  args: {
    uploadError: 'Upload timed out. Please try again.',
  },
}
