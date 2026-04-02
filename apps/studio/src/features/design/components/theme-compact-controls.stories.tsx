import type { Meta, StoryObj } from '@storybook/react'
import type { Theme } from '@valguide/core/features/themes/schema'
import { useEffect } from 'react'
import { fn } from 'storybook/test'
import { useThemeCustomizer } from '../use-theme-customizer'
import { ThemeCompactControls } from './theme-compact-controls'

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
    name: 'Gallery Dark',
    organizationId: 'org-1',
    basePreset: 'gallery-dark',
    colors: {
      background: '#131718',
      foreground: '#f8f5ef',
      card: '#1c2122',
      cardForeground: '#f8f5ef',
      popover: '#1c2122',
      popoverForeground: '#f8f5ef',
      primary: '#d8c4a3',
      primaryForeground: '#131718',
      secondary: '#2b3133',
      secondaryForeground: '#f8f5ef',
      muted: '#2b3133',
      mutedForeground: '#aab1b3',
      accent: '#425c53',
      accentForeground: '#f8f5ef',
      destructive: '#dc2626',
      destructiveForeground: '#fafafa',
      border: '#2b3133',
      input: '#2b3133',
      ring: '#d8c4a3',
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

function ThemeCompactControlsStory({
  themes = mockThemes,
  isLoading = false,
  dirty = false,
}: {
  themes?: Theme[]
  isLoading?: boolean
  dirty?: boolean
}) {
  const customizer = useThemeCustomizer('light')

  useEffect(() => {
    if (dirty && !customizer.config.isDirty) {
      customizer.setColor('primary', '#0F766E')
    }
  }, [customizer, dirty])

  return (
    <div className="flex min-h-screen items-end bg-muted/20 p-4">
      <div className="mx-auto w-full max-w-xl">
        <ThemeCompactControls
          customizer={customizer}
          themes={themes}
          isLoading={isLoading}
          onSelectTheme={fn()}
          onStartFromPreset={fn()}
          onDeleteTheme={fn()}
          onSave={fn()}
        />
      </div>
    </div>
  )
}

const meta = {
  title: 'Studio/Design/ThemeCompactControls',
  component: ThemeCompactControls,
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'mobile1',
    },
    chromatic: {
      viewports: [390, 834],
    },
  },
  tags: ['autodocs'],
  args: {
    customizer: undefined as never,
    themes: [],
    isLoading: false,
    onSelectTheme: fn(),
    onStartFromPreset: fn(),
    onDeleteTheme: fn(),
    onSave: fn(),
  },
} satisfies Meta<typeof ThemeCompactControls>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <ThemeCompactControlsStory />,
}

export const WithUnsavedChanges: Story = {
  render: () => <ThemeCompactControlsStory dirty />,
}

export const WithoutSavedThemes: Story = {
  render: () => <ThemeCompactControlsStory themes={[]} />,
}
