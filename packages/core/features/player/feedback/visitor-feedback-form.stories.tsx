import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { VisitorFeedbackForm } from './visitor-feedback-form'

const meta = {
  title: 'Visitor App/Player/Feedback/VisitorFeedbackForm',
  component: VisitorFeedbackForm,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="w-[350px] p-4 bg-background rounded-lg border">
        <Story />
      </div>
    ),
  ],
  args: {
    onSubmit: fn(),
  },
} satisfies Meta<typeof VisitorFeedbackForm>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Submitting: Story = {
  args: {
    isSubmitting: true,
  },
}
