import type { Meta, StoryObj } from '@storybook/react'
import { Button } from '@valguide/ui/components/button'
import { ChevronLeft, Globe } from 'lucide-react'
import { fn } from 'storybook/test'
import { EditorHeader } from './editor-header'

const meta = {
  title: 'Studio/Editor/EditorHeader',
  component: EditorHeader,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof EditorHeader>

export default meta
type Story = StoryObj<typeof meta>

export const WithBackButton: Story = {
  args: {
    backLabel: 'Tour Details',
    onBack: fn(),
  },
}

export const WithBackButtonAndActions: Story = {
  args: {
    backLabel: 'Tour Details',
    onBack: fn(),
    actions: (
      <>
        <Button variant="ghost" size="sm">
          <Globe className="mr-2 h-4 w-4" />
          EN
        </Button>
        <Button variant="ghost" size="sm">
          Preview
        </Button>
      </>
    ),
  },
}

export const WithCustomBackContent: Story = {
  args: {
    backContent: (
      <Button variant="ghost" size="sm" className="-ml-2">
        <ChevronLeft className="h-4 w-4" />
        <span>Art Museum Tour</span>
      </Button>
    ),
    actions: (
      <Button variant="ghost" size="sm">
        Preview
      </Button>
    ),
  },
}

export const WithBreadcrumbStyle: Story = {
  args: {
    backContent: (
      <div className="flex items-center gap-1 text-sm">
        <Button variant="ghost" size="sm" className="-ml-2">
          <ChevronLeft className="h-4 w-4" />
          <span>Tours</span>
        </Button>
        <span className="text-muted-foreground">/</span>
        <span className="font-medium">Art Museum Tour</span>
        <span className="text-muted-foreground">/</span>
        <span className="font-medium">Edit</span>
      </div>
    ),
  },
}
