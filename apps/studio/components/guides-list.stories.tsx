import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { NextIntlClientProvider } from 'next-intl'
import { GuidesList } from '@/features/guides/components/guides-list'
import { Guide } from '@valguide/features/guides/types'

// Import messages for the story
import enMessages from '@valguide/i18n/messages/en.json'
import deMessages from '@valguide/i18n/messages/de.json'
import rmMessages from '@valguide/i18n/messages/rm.json'

const meta: Meta<typeof GuidesList> = {
  title: 'Studio/Guides/GuidesList',
  component: GuidesList,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A component that displays a list of guides with an empty state when no guides exist. Prompts users to create their first guide.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story, { globals: { locale } }) => {
      const messages = locale === 'de' ? deMessages : locale === 'rm' ? rmMessages : enMessages
      const currentLocale = locale || 'en'

      return (
        <NextIntlClientProvider locale={currentLocale} messages={messages}>
          <Story />
        </NextIntlClientProvider>
      )
    },
  ],
}

export default meta
type Story = StoryObj<typeof meta>

// Sample guides data
const sampleGuides: Guide[] = [
  {
    id: '1',
    nanoId: '1',
    title: 'Ancient Egypt Exhibition',
    description:
      'Explore the wonders of Ancient Egypt with interactive audio guides, historical images, and expert narration.',
    imageUrl: 'https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=800&h=600&fit=crop',
    author: 'Dr. Sarah Johnson',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
    tags: ['history', 'ancient-egypt', 'archaeology'],
  },
  {
    id: '2',
    nanoId: '2',
    title: 'Modern Art Gallery Tour',
    description:
      'A comprehensive multimedia guide through our modern art collection featuring artist interviews and detailed analysis.',
    imageUrl: 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=800&h=600&fit=crop',
    author: 'Michael Chen',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-10'),
    tags: ['art', 'modern', 'gallery'],
  },
  {
    id: '3',
    nanoId: '3',
    title: 'Natural History: Dinosaurs',
    description:
      'Journey back in time with interactive videos, 3D models, and audio narration about the age of dinosaurs.',
    imageUrl: 'https://images.unsplash.com/photo-1581822261290-991b38693d1b?w=800&h=600&fit=crop',
    author: 'Prof. Alex Rivera',
    createdAt: new Date('2024-02-15'),
    tags: ['science', 'natural-history', 'dinosaurs', 'paleontology'],
  },
]

export const Empty: Story = {
  args: {
    guides: [],
    isLoading: false,
    error: null,
  },
}

export const Loading: Story = {
  args: {
    guides: [],
    isLoading: true,
    error: null,
  },
}

export const ErrorState: Story = {
  args: {
    guides: [],
    isLoading: false,
    error: { message: 'Failed to connect to the database. Please check your connection and try again.' } as Error,
  },
}

export const WithGuides: Story = {
  args: {
    guides: sampleGuides,
    isLoading: false,
    error: null,
  },
}

export const SingleGuide: Story = {
  args: {
    guides: sampleGuides.slice(0, 1),
    isLoading: false,
    error: null,
  },
}

export const WithCreateHandler: Story = {
  args: {
    guides: [],
    isLoading: false,
    error: null,
    onCreateGuide: async () => {
      console.log('Create guide clicked!')
      alert('Create guide clicked!')
      return {} as Guide
    },
  },
}
