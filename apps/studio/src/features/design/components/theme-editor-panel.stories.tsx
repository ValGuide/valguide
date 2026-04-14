import type { Meta, StoryObj } from '@storybook/react'
import type { Theme } from '@valguide/core/features/themes/schema'
import { useEffect } from 'react'
import { fn } from 'storybook/test'
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
    metadata: null,
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
    metadata: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'user-1',
  },
]

const meta: Meta<typeof ThemeEditorPanel> = {
  title: 'Studio/Design/ThemeEditorPanel',
  component: ThemeEditorPanel,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof ThemeEditorPanel>

function ThemeEditorPanelWrapper({
  themes = [],
  defaultThemeId = '1',
  canManageDefaultTheme = true,
  isLoading = false,
  layout = 'split',
  dirty = false,
}: {
  themes?: Theme[]
  defaultThemeId?: string | null
  canManageDefaultTheme?: boolean
  isLoading?: boolean
  layout?: 'workspace' | 'split' | 'mobile'
  dirty?: boolean
}) {
  const customizer = useThemeCustomizer('light')

  useEffect(() => {
    if (dirty && !customizer.config.isDirty) {
      customizer.setColor('primary', '#0F766E')
    }
  }, [customizer, dirty])

  return (
    <div className={layout === 'mobile' ? 'mx-auto h-[44rem] w-full max-w-md' : 'h-[52rem] w-full max-w-[96rem]'}>
      <ThemeEditorPanel
        customizer={customizer}
        themes={themes}
        defaultThemeId={defaultThemeId}
        canManageDefaultTheme={canManageDefaultTheme}
        isLoading={isLoading}
        onSelectTheme={fn()}
        onStartFromPreset={fn()}
        onDeleteTheme={fn()}
        onSetDefaultTheme={fn(async () => {})}
        onClearDefaultTheme={fn(async () => {})}
        onSave={fn()}
        layout={layout}
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

export const WorkspaceLayout: Story = {
  render: () => <ThemeEditorPanelWrapper themes={mockThemes} layout="workspace" />,
}

export const WithoutDefaultTheme: Story = {
  render: () => <ThemeEditorPanelWrapper themes={mockThemes} defaultThemeId={null} />,
}

export const MobileLayout: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  render: () => <ThemeEditorPanelWrapper themes={mockThemes} layout="mobile" dirty />,
}
