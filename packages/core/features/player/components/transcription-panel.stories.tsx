import type { Meta, StoryObj } from '@storybook/react'
import { TranscriptionPanel } from './transcription-panel'

const sampleTranscript = `Welcome to the Museum of Modern Art. Today we'll explore the iconic painting "The Starry Night" by Vincent van Gogh.

Painted in June 1889, this masterpiece depicts the view from Van Gogh's asylum room at Saint-Rémy-de-Provence, though painted during the day from memory.

The swirling patterns in the sky have become one of the most recognizable images in Western art. The painting is characterized by bold, expressive brushwork and the vivid blue and yellow color palette that Van Gogh favored.

Notice how the cypress tree in the foreground reaches toward the sky, creating a visual bridge between earth and the heavens. The sleeping village below provides a peaceful contrast to the turbulent sky above.`

const meta = {
  title: 'Visitor App/Player/TranscriptionPanel',
  component: TranscriptionPanel,
  parameters: {
    layout: 'padded',
  },
  args: {
    transcript: sampleTranscript,
  },
} satisfies Meta<typeof TranscriptionPanel>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Expanded: Story = {
  args: {
    defaultExpanded: true,
  },
}

export const NoTranscript: Story = {
  args: {
    transcript: null,
  },
}
