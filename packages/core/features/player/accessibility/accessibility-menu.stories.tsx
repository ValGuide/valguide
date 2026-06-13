import type { Meta, StoryObj } from '@storybook/react'
import { AccessibilityMenu } from './accessibility-menu'

const meta = {
  title: 'Visitor App/Player/AccessibilityMenu',
  component: AccessibilityMenu,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof AccessibilityMenu>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
