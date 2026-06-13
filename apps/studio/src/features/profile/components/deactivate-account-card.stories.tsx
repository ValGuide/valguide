import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { DeactivateAccountCard } from './deactivate-account-card'

const meta: Meta<typeof DeactivateAccountCard> = {
  title: 'Studio/Profile/DeactivateAccountCard',
  component: DeactivateAccountCard,
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

type Story = StoryObj<typeof DeactivateAccountCard>

export const Default: Story = {
  args: {
    email: 'curator@museum.org',
    onDeactivate: fn(async () => {
      await new Promise((r) => setTimeout(r, 1500))
    }),
  },
}
