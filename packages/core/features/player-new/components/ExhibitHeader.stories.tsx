import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ExhibitHeader } from './ExhibitHeader'

const meta: Meta<typeof ExhibitHeader> = {
  title: 'Player New/ExhibitHeader',
  component: ExhibitHeader,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div className="relative h-64 w-full bg-slate-800">
        <Story />
      </div>
    ),
  ],
}

export default meta

export const Default: StoryObj<typeof ExhibitHeader> = {
  args: {
    title: 'The Starry Night',
    museumName: 'Museum of Modern Art',
    onClose: () => console.log('Close clicked'),
  },
}

export const LongTitles: StoryObj<typeof ExhibitHeader> = {
  args: {
    title: 'Portrait of Madame X (Madame Pierre Gautreau)',
    museumName: 'The Metropolitan Museum of Art',
    onClose: () => console.log('Close clicked'),
  },
}
