import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { TranscriptDrawer } from './TranscriptDrawer'
import { useState } from 'react'

const meta: Meta<typeof TranscriptDrawer> = {
  title: 'Player New/TranscriptDrawer',
  component: TranscriptDrawer,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div className="relative h-screen w-full bg-slate-900 flex items-end justify-center p-4">
        <div className="text-white mb-20">Click the "Transcript & More" button below</div>
        <Story />
      </div>
    ),
  ],
}

export default meta

const sampleTranscript = [
  { id: '1', startTime: 0, endTime: 10, text: "Welcome to The Starry Night by Vincent van Gogh." },
  { id: '2', startTime: 10, endTime: 25, text: "Painted in June 1889, it depicts the view from the east-facing window of his asylum room at Saint-Rémy-de-Provence." },
  { id: '3', startTime: 25, endTime: 40, text: "You can see the swirling sky, which dominates the composition." },
  { id: '4', startTime: 40, endTime: 60, text: "Notice the cypress tree in the foreground, acting as a dark, flame-like connection between earth and sky." }
]

export const Default: StoryObj<typeof TranscriptDrawer> = {
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false)
    return (
      <TranscriptDrawer 
        {...args} 
        isOpen={isOpen} 
        onOpenChange={setIsOpen} 
      />
    )
  },
  args: {
    transcript: sampleTranscript,
    currentTime: 0,
    isOpen: false,
    onOpenChange: () => {},
  },
}

export const ActiveSegment: StoryObj<typeof TranscriptDrawer> = {
  render: (args) => {
    const [isOpen, setIsOpen] = useState(true)
    return (
      <TranscriptDrawer 
        {...args} 
        isOpen={isOpen} 
        onOpenChange={setIsOpen} 
      />
    )
  },
  args: {
    transcript: sampleTranscript,
    currentTime: 15, // Should highlight the second segment
    isOpen: true,
    onOpenChange: () => {},
  },
}

export const NoTranscript: StoryObj<typeof TranscriptDrawer> = {
  render: (args) => {
    const [isOpen, setIsOpen] = useState(true)
    return (
      <TranscriptDrawer 
        {...args} 
        isOpen={isOpen} 
        onOpenChange={setIsOpen} 
      />
    )
  },
  args: {
    transcript: undefined,
    currentTime: 0,
    isOpen: true,
    onOpenChange: () => {},
  },
}
