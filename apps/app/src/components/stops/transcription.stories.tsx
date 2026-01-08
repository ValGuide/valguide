import type { Meta, StoryObj } from '@storybook/react'
import { Transcription } from '@/components/stops/transcription'

const meta: Meta<typeof Transcription> = {
  title: 'App/Stop/Transcription',
  component: Transcription,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="max-w-2xl">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof Transcription>

export const Short: Story = {
  args: {
    content: 'This is a short transcription of the audio content.',
  },
}

export const Long: Story = {
  args: {
    content: `This is a longer transcription of the audio content. It contains multiple sentences and demonstrates how the transcription component handles larger amounts of text.

The transcription can span multiple paragraphs and provide a complete textual representation of the spoken audio guide. This is particularly useful for accessibility purposes and for visitors who prefer to read along with the audio.

Museums and cultural institutions often provide transcriptions to ensure their content is accessible to all visitors, regardless of hearing ability or language proficiency.`,
  },
}

export const Empty: Story = {
  args: {
    content: '',
  },
}
