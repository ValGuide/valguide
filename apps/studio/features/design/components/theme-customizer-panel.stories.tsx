import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useThemeCustomizer } from '../use-theme-customizer'
import { ThemeCustomizerPanel } from './theme-customizer-panel'

const meta: Meta<typeof ThemeCustomizerPanel> = {
  title: 'Studio/Design/ThemeCustomizerPanel',
  component: ThemeCustomizerPanel,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof ThemeCustomizerPanel>

function ThemeCustomizerPanelWrapper({ initialTheme = 'light' }: { initialTheme?: 'light' | 'dark' | 'blue' }) {
  const customizer = useThemeCustomizer(initialTheme)
  return (
    <div className="w-[400px] h-[600px]">
      <ThemeCustomizerPanel customizer={customizer} />
    </div>
  )
}

export const Default: Story = {
  render: () => <ThemeCustomizerPanelWrapper />,
}

export const DarkTheme: Story = {
  render: () => <ThemeCustomizerPanelWrapper initialTheme="dark" />,
}

export const BlueTheme: Story = {
  render: () => <ThemeCustomizerPanelWrapper initialTheme="blue" />,
}
