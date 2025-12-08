import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { themePresets } from '../theme-presets'
import { PlayerPreview } from './player-preview'

const meta: Meta<typeof PlayerPreview> = {
  title: 'Studio/Design/PlayerPreview',
  component: PlayerPreview,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof PlayerPreview>

function getStyleFromPreset(theme: keyof typeof themePresets, radius = 0.5) {
  const colors = themePresets[theme]
  return {
    '--background': colors.background,
    '--foreground': colors.foreground,
    '--card': colors.card,
    '--card-foreground': colors.cardForeground,
    '--popover': colors.popover,
    '--popover-foreground': colors.popoverForeground,
    '--primary': colors.primary,
    '--primary-foreground': colors.primaryForeground,
    '--secondary': colors.secondary,
    '--secondary-foreground': colors.secondaryForeground,
    '--muted': colors.muted,
    '--muted-foreground': colors.mutedForeground,
    '--accent': colors.accent,
    '--accent-foreground': colors.accentForeground,
    '--destructive': colors.destructive,
    '--destructive-foreground': colors.destructiveForeground,
    '--border': colors.border,
    '--input': colors.input,
    '--ring': colors.ring,
    '--radius': `${radius}rem`,
  } as React.CSSProperties
}

export const Light: Story = {
  render: () => <PlayerPreview style={getStyleFromPreset('light')} className="w-96" />,
}

export const Dark: Story = {
  render: () => <PlayerPreview style={getStyleFromPreset('dark')} className="w-96" />,
}

export const Blue: Story = {
  render: () => <PlayerPreview style={getStyleFromPreset('blue')} className="w-96" />,
}

export const BlueDark: Story = {
  render: () => <PlayerPreview style={getStyleFromPreset('blue-dark')} className="w-96" />,
}

export const Green: Story = {
  render: () => <PlayerPreview style={getStyleFromPreset('green')} className="w-96" />,
}

export const GreenDark: Story = {
  render: () => <PlayerPreview style={getStyleFromPreset('green-dark')} className="w-96" />,
}

export const Purple: Story = {
  render: () => <PlayerPreview style={getStyleFromPreset('purple')} className="w-96" />,
}

export const PurpleDark: Story = {
  render: () => <PlayerPreview style={getStyleFromPreset('purple-dark')} className="w-96" />,
}

export const NoRadius: Story = {
  render: () => <PlayerPreview style={getStyleFromPreset('light', 0)} className="w-96" />,
}

export const LargeRadius: Story = {
  render: () => <PlayerPreview style={getStyleFromPreset('light', 1)} className="w-96" />,
}
