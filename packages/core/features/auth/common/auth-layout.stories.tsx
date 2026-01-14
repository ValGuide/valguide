import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useTranslations } from '@valguide/core/i18n/client'
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
            <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">ValGuide</p>
            <h2 className="mt-3 text-3xl tracking-tight font-serif">{t('welcome')}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{t('loginPrompt')}</p>
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
