import type { Meta, StoryObj } from '@storybook/react'
import { AssetsGlobalDropOverlay } from './assets-global-drop-overlay'

const meta = {
  title: 'Studio/Assets/Upload/GlobalDropOverlay',
  component: AssetsGlobalDropOverlay,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  args: {
    open: true,
  },
  decorators: [
    (Story) => (
      <div className="relative h-screen w-full bg-background">
        <div className="flex flex-col gap-4 p-8">
          <div className="h-32 w-full rounded-lg bg-muted" />
          <div className="grid grid-cols-3 gap-4">
            <div className="h-48 rounded-lg bg-muted" />
            <div className="h-48 rounded-lg bg-muted" />
            <div className="h-48 rounded-lg bg-muted" />
          </div>
          <div className="h-24 w-2/3 rounded-lg bg-muted" />
        </div>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AssetsGlobalDropOverlay>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Hidden: Story = {
  args: {
    open: false,
  },
}
