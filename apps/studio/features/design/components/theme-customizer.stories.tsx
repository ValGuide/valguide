import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ThemeCustomizer } from './theme-customizer'

const meta: Meta<typeof ThemeCustomizer> = {
  title: 'Studio/Design/ThemeCustomizer',
  component: ThemeCustomizer,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof ThemeCustomizer>

export const Default: Story = {
  render: () => (
    <div className="p-6 h-screen">
      <ThemeCustomizer initialTheme="light" />
    </div>
  ),
}

export const DarkTheme: Story = {
  render: () => (
    <div className="p-6 h-screen">
      <ThemeCustomizer initialTheme="dark" />
    </div>
  ),
}

export const BlueTheme: Story = {
  render: () => (
    <div className="p-6 h-screen">
      <ThemeCustomizer initialTheme="blue" />
    </div>
  ),
}

export const GreenTheme: Story = {
  render: () => (
    <div className="p-6 h-screen">
      <ThemeCustomizer initialTheme="green" />
    </div>
  ),
}

export const PurpleTheme: Story = {
  render: () => (
    <div className="p-6 h-screen">
      <ThemeCustomizer initialTheme="purple" />
    </div>
  ),
}
