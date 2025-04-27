import { Meta, StoryObj } from '@storybook/react'
import { LoginForm } from './login-form'

const meta: Meta<typeof LoginForm> = {
  title: 'Auth/LoginForm',
  component: LoginForm,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof LoginForm>

export const Default: Story = {
  args: {
    email: '',
    onEmailChange: () => {},
    onSubmit: (e) => {
      e.preventDefault()
      alert('Form submitted')
    },
    loading: false,
    submitText: 'Send login code',
    loadingText: 'Sending...',
    emailLabel: 'Email address',
    emailPlaceholder: 'Enter your email',
  },
}

export const WithEmail: Story = {
  args: {
    email: 'user@example.com',
    onEmailChange: () => {},
    onSubmit: (e) => {
      e.preventDefault()
      alert('Form submitted')
    },
    loading: false,
    submitText: 'Send login code',
    loadingText: 'Sending...',
    emailLabel: 'Email address',
    emailPlaceholder: 'Enter your email',
  },
}

export const Loading: Story = {
  args: {
    email: 'user@example.com',
    onEmailChange: () => {},
    onSubmit: (e) => {
      e.preventDefault()
    },
    loading: true,
    submitText: 'Send login code',
    loadingText: 'Sending...',
    emailLabel: 'Email address',
    emailPlaceholder: 'Enter your email',
  },
}
