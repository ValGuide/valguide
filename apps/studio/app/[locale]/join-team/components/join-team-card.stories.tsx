import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import deMessages from '@valguide/i18n/messages/de.json'
import enMessages from '@valguide/i18n/messages/en.json'
import rmMessages from '@valguide/i18n/messages/rm.json'
import { NextIntlClientProvider } from 'next-intl'
import { JoinTeamCard } from './join-team-card'

const meta = {
  title: 'Features/JoinTeam/JoinTeamCard',
  component: JoinTeamCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    nextjs: {
      appDirectory: true,
    },
  },
  decorators: [
    (Story, { globals: { locale } }) => {
      const messages = locale === 'de' ? deMessages : locale === 'rm' ? rmMessages : enMessages
      const currentLocale = locale || 'en'

      return (
        <NextIntlClientProvider locale={currentLocale} messages={messages}>
          <Story />
        </NextIntlClientProvider>
      )
    },
  ],
} satisfies Meta<typeof JoinTeamCard>

export default meta
type Story = StoryObj<typeof meta>

const mockInvite = {
  organization: { name: 'Acme Museum' },
  email: 'jane@example.com',
}

const mockSignOut = async () => {
  console.log('Sign out clicked')
}

export const Invalid: Story = {
  args: {
    variant: 'invalid',
  },
}

export const Public: Story = {
  args: {
    variant: 'public',
    invite: mockInvite,
    nextUrl: '/join-team',
  },
}

export const WrongAccount: Story = {
  args: {
    variant: 'wrong-account',
    invite: mockInvite,
    userEmail: 'wrong@example.com',
    onSignOut: mockSignOut,
  },
}

export const Joining: Story = {
  args: {
    variant: 'joining',
    invite: mockInvite,
  },
}

export const JoiningError: Story = {
  args: {
    variant: 'joining',
    invite: mockInvite,
    error: 'Failed to join team',
  },
}
