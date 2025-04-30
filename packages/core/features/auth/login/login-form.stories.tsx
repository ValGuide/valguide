import { Meta, StoryObj } from '@storybook/react'
import { useTranslations } from 'next-intl'
import { LoginForm } from './login-form'

const meta: Meta<typeof LoginForm> = {
  title: 'Auth/LoginForm',
  component: LoginForm,
  render: (args) => {
    const t = useTranslations('login')
    return (
      <LoginForm
        {...args}
        submitText={t('sendCode')}
        loadingText={t('sending')}
        emailLabel={t('emailLabel')}
        emailPlaceholder={t('emailPlaceholder')}
      />
    )
  },
}

export default meta
type Story = StoryObj<typeof LoginForm>

export const Default: Story = {
  args: {
    email: '',
    onEmailChange: (email) => {
      console.log('Email changed:', email)
    },
    onSubmit: (email) => {
      alert(`Form submitted with email: ${email}`)
    },
    loading: false,
  },
}

export const WithEmail: Story = {
  args: {
    email: 'user@example.com',
    onEmailChange: (email) => {
      console.log('Email changed:', email)
    },
    onSubmit: (email) => {
      alert(`Form submitted with email: ${email}`)
    },
    loading: false,
  },
}

export const Loading: Story = {
  args: {
    email: 'user@example.com',
    onEmailChange: (email) => {
      console.log('Email changed:', email)
    },
    onSubmit: (email) => {
      console.log('Form submitted with email:', email)
    },
    loading: true,
  },
}
