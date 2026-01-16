import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { toast } from 'sonner'
import { Button } from './button'
import { Toaster } from './sonner'
import { X } from 'lucide-react'

const meta: Meta<typeof Toaster> = {
  title: 'Common/Sonner',
  component: Toaster,
  decorators: [
    (Story) => (
      <>
        <Story />
        <Toaster />
      </>
    ),
  ],
}

export default meta

type Story = StoryObj<typeof Toaster>

export const Default: Story = {
  render: () => (
    <Button onClick={() => toast('This is a default toast')}>Show Toast</Button>
  ),
}

export const Success: Story = {
  render: () => (
    <Button onClick={() => toast.success('Operation completed successfully')}>
      Show Success
    </Button>
  ),
}

export const Error: Story = {
  render: () => (
    <Button onClick={() => toast.error('Something went wrong')}>Show Error</Button>
  ),
}

export const Warning: Story = {
  render: () => (
    <Button onClick={() => toast.warning('Please check your input')}>
      Show Warning
    </Button>
  ),
}

export const Info: Story = {
  render: () => (
    <Button onClick={() => toast.info('Here is some information')}>Show Info</Button>
  ),
}

export const Loading: Story = {
  render: () => (
    <Button onClick={() => toast.loading('Loading...')}>Show Loading</Button>
  ),
}

export const WithDescription: Story = {
  render: () => (
    <Button
      onClick={() =>
        toast('Event has been created', {
          description: 'Monday, January 3rd at 6:00pm',
        })
      }
    >
      With Description
    </Button>
  ),
}

export const WithAction: Story = {
  render: () => (
    <Button
      onClick={() =>
        toast('Event has been created', {
          dismissible: true,
          action: {
            label: 'Undo',
            onClick: () => console.log('Undo clicked'),
          },
        })
      }
    >
      With Action
    </Button>
  ),
}


export const Closeable: Story = {
  render: () => (
    <Button
      onClick={() =>
        toast.custom((t) => (
          <div className="relative rounded-lg bg-white p-4 shadow">
            {/* Close button */}
            <button
              onClick={() => toast.dismiss(t)}
              className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
              aria-label="Close"
            >
              <X size={16} />
            </button>

            {/* Toast content */}
            <p className="pr-6 text-sm">
              Your changes have been saved.
            </p>
          </div>
        ))
      }
    >
      With Action
    </Button >
  ),
}

export const Promise: Story = {
  render: () => (
    <Button
      onClick={() => {
        const promise = () =>
          new Promise<{ name: string }>((resolve) =>
            setTimeout(() => resolve({ name: 'Sonner' }), 2000),
          )

        toast.promise(promise, {
          loading: 'Loading...',
          success: (data) => `${data.name} toast has been added`,
          error: 'Error',
        })
      }}
    >
      Show Promise
    </Button>
  ),
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Button onClick={() => toast('Default toast')}>Default</Button>
      <Button onClick={() => toast.success('Success toast')}>Success</Button>
      <Button onClick={() => toast.error('Error toast')}>Error</Button>
      <Button onClick={() => toast.warning('Warning toast')}>Warning</Button>
      <Button onClick={() => toast.info('Info toast')}>Info</Button>
      <Button onClick={() => toast.loading('Loading toast')}>Loading</Button>
    </div>
  ),
}
