import { Meta, StoryObj } from '@storybook/react'
import { useTranslations } from 'next-intl'
import { AuthLayout } from './auth-layout'

const meta: Meta<typeof AuthLayout> = {
  title: 'Auth/AuthLayout',
  component: AuthLayout,
  parameters: {
    layout: 'fullscreen',
  },
  render: (args) => {
    const t = useTranslations('login')
    return (
      <AuthLayout {...args}>
        {args.children || (
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold tracking-tight">{t('welcome')}</h2>
            <p className="mt-2 text-sm text-gray-600">{t('loginPrompt')}</p>
          </div>
        )}
      </AuthLayout>
    )
  },
}

export default meta
type Story = StoryObj<typeof AuthLayout>

export const Default: Story = {
  args: {},
}

export const CustomImage: Story = {
  args: {
    imageUrl:
      'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    imageAlt: 'Colorful abstract background',
  },
}
