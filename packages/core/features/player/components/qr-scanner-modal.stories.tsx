import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { QrScannerModal } from './qr-scanner-modal'

const meta = {
  title: 'Visitor App/Player/QrScannerModal',
  component: QrScannerModal,
  parameters: {
    layout: 'centered',
  },
  args: {
    open: true,
    onOpenChange: fn(),
    onScan: fn(),
  },
} satisfies Meta<typeof QrScannerModal>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
