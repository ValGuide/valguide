import type { Meta, StoryObj } from '@storybook/react'
import { useTranslations } from '@valguide/core/i18n/client'
import { NotFoundPage } from '@valguide/features/404/not-found-page'

function AdminNotFoundPage() {
  const t = useTranslations('admin.notFound')
  return <NotFoundPage i18n={{ title: t('title'), description: t('description'), homeButton: t('homeButton') }} />
}

const meta: Meta<typeof AdminNotFoundPage> = {
  title: 'Admin/NotFoundPage',
  component: AdminNotFoundPage,
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta

type Story = StoryObj<typeof AdminNotFoundPage>

export const Default: Story = {}
