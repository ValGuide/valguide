import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { DeleteAccountCard } from './delete-account-card'

const meta: Meta<typeof DeleteAccountCard> = {
  title: 'Studio/Features/Profile/DeleteAccountCard',
  component: DeleteAccountCard,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="w-[600px]">
        <Story />
      </div>
    ),
  ],
}

export default meta

type Story = StoryObj<typeof DeleteAccountCard>

export const Default: Story = {
  args: {
    email: 'curator@museum.org',
    onDelete: fn(async () => {
      await new Promise((r) => setTimeout(r, 1500))
    }),
  },
}
