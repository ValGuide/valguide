import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { BlockedPage } from './blocked-page'

const meta: Meta<typeof BlockedPage> = {
  title: 'Auth/BlockedPage',
  component: BlockedPage,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    onSignOut: fn(),
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
