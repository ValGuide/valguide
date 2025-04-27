import { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { AuthLayout } from './auth-layout'
import { LoginForm } from './login-form'
import { MessageAlert } from './message-alert'
import { SocialLoginButtons } from './social-login-buttons'

const LoginPageExample = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      if (email.includes('@')) {
        setMessage({ type: 'success', text: 'Check your email for the login code' })
      } else {
        setMessage({ type: 'error', text: 'Please enter a valid email address' })
      }
    }, 1000)
  }

  const handleGoogleLogin = () => {
    alert('Google login clicked')
  }

  const handleAppleLogin = () => {
    alert('Apple login clicked')
  }

  return (
    <AuthLayout>
      <div className="text-center">
        <h2 className="mt-6 text-3xl font-bold tracking-tight">Welcome</h2>
        <p className="mt-2 text-sm text-gray-600">Sign in to your account</p>
      </div>

      {message && <MessageAlert type={message.type}>{message.text}</MessageAlert>}

      <LoginForm
        email={email}
        onEmailChange={(e) => setEmail(e.target.value)}
        onSubmit={handleSubmit}
        loading={loading}
        submitText="Send login code"
        loadingText="Sending..."
        emailLabel="Email address"
        emailPlaceholder="Enter your email"
      />

      <SocialLoginButtons
        onGoogleClick={handleGoogleLogin}
        onAppleClick={handleAppleLogin}
        loading={loading}
        dividerText="Or continue with"
      />
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
