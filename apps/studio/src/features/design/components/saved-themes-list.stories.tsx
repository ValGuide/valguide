import type { Meta, StoryObj } from '@storybook/react'
import type { Theme } from '@valguide/core/features/themes/schema'
import { fn } from 'storybook/test'
import { SavedThemesList } from './saved-themes-list'

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
    name: 'Gallery Dark',
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

const meta = {
  title: 'Studio/Design/SavedThemesList',
  component: SavedThemesList,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  args: {
    themes: mockThemes,
    isLoading: false,
    selectedThemeId: '2',
    defaultThemeId: '1',
    canManageDefaultTheme: true,
    onSelectTheme: fn(),
    onDeleteTheme: fn(),
    onSetDefaultTheme: fn(async () => {}),
    onClearDefaultTheme: fn(async () => {}),
  },
} satisfies Meta<typeof SavedThemesList>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const NoDefaultTheme: Story = {
  args: {
    defaultThemeId: null,
  },
}

export const ReadOnly: Story = {
  args: {
    canManageDefaultTheme: false,
    onSetDefaultTheme: undefined,
    onClearDefaultTheme: undefined,
  },
}
