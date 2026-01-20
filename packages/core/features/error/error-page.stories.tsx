import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { ErrorPage } from './error-page'

const meta: Meta<typeof ErrorPage> = {
  title: 'Core/Error/ErrorPage',
  component: ErrorPage,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Global error page displayed when an unexpected error occurs in the application.',
      },
    },
  },
}

export default meta

type Story = StoryObj<typeof ErrorPage>

export const Default: Story = {
  args: {
    i18n: {
      title: 'Something went wrong',
      description: 'An unexpected error occurred. Please try again or return to the home page.',
      tryAgain: 'Try again',
    },
    reset: fn(),
  },
}

export const WithError: Story = {
  args: {
    i18n: {
      title: 'Something went wrong',
      description: 'An unexpected error occurred. Please try again or return to the home page.',
      tryAgain: 'Try again',
    },
    error: new Error('TypeError: Cannot read properties of undefined (reading "map")'),
    reset: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Error page with error message visible (only shown in development mode).',
      },
    },
  },
}

export const WithoutReset: Story = {
  args: {
    i18n: {
      title: 'Something went wrong',
      description: 'An unexpected error occurred. Please return to the home page.',
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Error page without a reset/try again button.',
      },
    },
  },
}

export const German: Story = {
  args: {
    i18n: {
      title: 'Etwas ist schiefgelaufen',
      description:
        'Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut oder kehren Sie zur Startseite zurück.',
      tryAgain: 'Erneut versuchen',
    },
    reset: fn(),
  },
}

export const CustomError: Story = {
  args: {
    i18n: {
      title: 'Connection Lost',
      description: 'Unable to connect to the server. Please check your internet connection and try again.',
      tryAgain: 'Reconnect',
    },
    reset: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Custom error messaging for specific error scenarios.',
      },
    },
  },
}
