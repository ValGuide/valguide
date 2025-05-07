import { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { AuthLayout } from '../common/auth-layout'
import { AuthForm } from '../auth-form'
import { MessageAlert } from '../common/message-alert'
import { Consent } from '../consent'

const LoginPageExample = () => {
  const t = useTranslations('login')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = (email: string) => {
    setLoading(true)
    setMessage(null)

    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      if (email.includes('@')) {
        setMessage({ type: 'success', text: t('otpSent') })
      } else {
        setMessage({ type: 'error', text: t('email.message') })
      }
    }, 1000)
  }

  return (
    <AuthLayout>
      <div className="text-center">
        <h2 className="mt-6 text-3xl font-bold tracking-tight">{t('welcome')}</h2>
        <p className="mt-2 text-sm text-gray-600">{t('loginPrompt')}</p>
      </div>

      {message && <MessageAlert type={message.type}>{message.text}</MessageAlert>}

      <AuthForm
        email={email}
        onEmailChange={(email) => setEmail(email)}
        onSubmit={handleSubmit}
        loading={loading}
        submitText={t('sendCode')}
        loadingText={t('sending')}
        emailLabel={t('emailLabel')}
        emailPlaceholder={t('emailPlaceholder')}
        isLogin={true}
      />
      <Consent />
    </AuthLayout>
  )
}

const meta: Meta = {
  title: 'Auth/LoginPage',
  component: LoginPageExample,
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj

export const Default: Story = {}
