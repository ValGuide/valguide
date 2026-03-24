import type { Meta, StoryObj } from '@storybook/react'
import { AssetsGlobalDropOverlay } from './assets-global-drop-overlay'

const meta = {
  title: 'Assets/Upload/GlobalDropOverlay',
  component: AssetsGlobalDropOverlay,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  args: {
    open: true,
  },
} satisfies Meta<typeof AssetsGlobalDropOverlay>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Hidden: Story = {
  args: {
    open: false,
  },
}
