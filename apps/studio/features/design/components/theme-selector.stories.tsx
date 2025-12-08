import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import type { Theme } from '@valguide/ui/theme/themes'
import { useState } from 'react'
import { ThemeSelector } from './theme-selector'

const meta: Meta<typeof ThemeSelector> = {
  title: 'Studio/Design/ThemeSelector',
  component: ThemeSelector,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof ThemeSelector>

function ThemeSelectorWithState({ initialValue = 'light' }: { initialValue?: Theme | 'custom' }) {
  const [value, setValue] = useState<Theme | 'custom'>(initialValue)
  return (
    <div className="w-64">
      <ThemeSelector value={value} onValueChange={setValue} />
    </div>
  )
}

export const Default: Story = {
  render: () => <ThemeSelectorWithState />,
}

export const DarkThemeSelected: Story = {
  render: () => <ThemeSelectorWithState initialValue="dark" />,
}

export const BlueThemeSelected: Story = {
  render: () => <ThemeSelectorWithState initialValue="blue" />,
}

export const CustomTheme: Story = {
  render: () => <ThemeSelectorWithState initialValue="custom" />,
}
