import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useTranslations } from '@valguide/core/i18n/client'
import { NotFoundPage } from './not-found-page'

function NotFoundPageWithTranslations() {
  const t = useTranslations('notFound')
  return <NotFoundPage i18n={{ title: t('title'), description: t('description') }} />
}

const meta: Meta<typeof NotFoundPageWithTranslations> = {
  title: 'Core/404/NotFoundPage',
  component: NotFoundPageWithTranslations,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Global 404 page displayed when a route is not found.',
      },
    },
  },
}

export default meta

type Story = StoryObj<typeof NotFoundPageWithTranslations>

export const Default: Story = {}
