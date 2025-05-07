import { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { SignupForm } from './signup-form'

const SignupFormExample = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (email: string) => {
    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
      console.log('Form submitted with email:', email)
    }, 1000)
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      {submitted ? (
        <div className="text-center p-4 bg-green-100 rounded mb-4">
          <p className="text-green-800">Verification code sent to {email}</p>
          <button
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => setSubmitted(false)}
          >
            Reset Form
          </button>
        </div>
      ) : (
        <SignupForm
          email={email}
          onEmailChange={setEmail}
          onSubmit={handleSubmit}
          loading={loading}
          submitText="Send Verification Code"
          loadingText="Sending..."
          emailLabel="Email Address"
          emailPlaceholder="Enter your email"
        />
      )}
    </div>
  )
}

const meta: Meta = {
  title: 'Auth/SignupForm',
  component: SignupFormExample,
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj

export const Default: Story = {}

export const WithPrefilledEmail: Story = {
  render: () => {
    const [email, setEmail] = useState('user@example.com')
    const [loading, setLoading] = useState(false)

    const handleSubmit = (email: string) => {
      setLoading(true)

      // Simulate API call
      setTimeout(() => {
        setLoading(false)
        console.log('Form submitted with email:', email)
      }, 1000)
    }

    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <SignupForm
          email={email}
          onEmailChange={setEmail}
          onSubmit={handleSubmit}
          loading={loading}
          submitText="Send Verification Code"
          loadingText="Sending..."
          emailLabel="Email Address"
          emailPlaceholder="Enter your email"
        />
      </div>
    )
  },
}

export const Loading: Story = {
  render: () => {
    const [email, setEmail] = useState('user@example.com')

    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <SignupForm
          email={email}
          onEmailChange={setEmail}
          onSubmit={() => {}}
          loading={true}
          submitText="Send Verification Code"
          loadingText="Sending..."
          emailLabel="Email Address"
          emailPlaceholder="Enter your email"
        />
      </div>
    )
  },
}
