import type { Meta, StoryObj } from '@storybook/react'
import type { Theme } from '@valguide/core/features/themes/schema'
import { useThemeCustomizer } from '../use-theme-customizer'
import { ThemeEditorPanel } from './theme-editor-panel'

const mockThemes: Theme[] = [
  {
    id: '1',
    nanoId: 'abc123def0',
    name: 'Brand Primary',
    organizationId: 'org-1',
    basePreset: 'light',
    colors: {
      background: '#ffffff',
      foreground: '#0a0a0c',
      card: '#ffffff',
      cardForeground: '#0a0a0c',
      popover: '#ffffff',
      popoverForeground: '#0a0a0c',
      primary: '#2563eb',
      primaryForeground: '#ffffff',
      secondary: '#f4f4f5',
      secondaryForeground: '#18181b',
      muted: '#f4f4f5',
      mutedForeground: '#71717a',
      accent: '#f4f4f5',
      accentForeground: '#18181b',
      destructive: '#ef4444',
      destructiveForeground: '#fafafa',
      border: '#e4e4e7',
      input: '#e4e4e7',
      ring: '#2563eb',
    },
    radius: '0.5',
    fonts: {
      primary: { source: 'system', family: 'Inter' },
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'user-1',
  },
  {
    id: '2',
    nanoId: 'xyz789ghi1',
    name: 'Dark Mode',
    organizationId: 'org-1',
    basePreset: 'dark',
    colors: {
      background: '#0a0a0a',
      foreground: '#fafafa',
      card: '#171717',
      cardForeground: '#fafafa',
      popover: '#171717',
      popoverForeground: '#fafafa',
      primary: '#fafafa',
      primaryForeground: '#171717',
      secondary: '#262626',
      secondaryForeground: '#fafafa',
      muted: '#262626',
      mutedForeground: '#a3a3a3',
      accent: '#262626',
      accentForeground: '#fafafa',
      destructive: '#dc2626',
      destructiveForeground: '#fafafa',
      border: '#262626',
      input: '#262626',
      ring: '#737373',
    },
    radius: '0.5',
    fonts: {
      primary: { source: 'system', family: 'Inter' },
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'user-1',
  },
]

const meta: Meta<typeof ThemeEditorPanel> = {
  title: 'Studio/Design/ThemeEditorPanel',
  component: ThemeEditorPanel,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof ThemeEditorPanel>

function ThemeEditorPanelWrapper({ themes = [], isLoading = false }: { themes?: Theme[]; isLoading?: boolean }) {
  const customizer = useThemeCustomizer('light')
  return (
    <div className="w-100 h-175">
      <ThemeEditorPanel
        customizer={customizer}
        themes={themes}
        isLoading={isLoading}
        onSelectTheme={() => {}}
        onStartFromPreset={() => {}}
        onDeleteTheme={() => {}}
        onSave={() => {}}
      />
    </div>
  )
}

export const Default: Story = {
  render: () => <ThemeEditorPanelWrapper />,
}

export const WithSavedThemes: Story = {
  render: () => <ThemeEditorPanelWrapper themes={mockThemes} />,
}

export const Loading: Story = {
  render: () => <ThemeEditorPanelWrapper isLoading />,
}
