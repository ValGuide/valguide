import type { Meta, StoryObj } from '@storybook/react'
import { Button } from '@valguide/ui/components/button'
import { fn } from 'storybook/test'
import { EditSlugDialog } from './edit-slug-dialog'

const MockSlugSettings = ({
  tourTitle,
  onSaved,
}: {
  tourNanoId: string
  tourTitle: string
  variant?: 'card' | 'plain'
  onSaved?: () => void
}) => (
  <div className="space-y-4">
    <div className="space-y-2">
      <p className="text-sm font-medium">Slug preview</p>
      <div className="rounded-md border px-3 py-2 text-sm text-muted-foreground">
        valguide.com/museum/{tourTitle.toLowerCase().replace(/\s+/g, '-')}
      </div>
    </div>
    <Button onClick={onSaved}>Save slug</Button>
  </div>
)

const meta = {
  title: 'Studio/Tours/Dialogs/EditSlugDialog',
  component: EditSlugDialog,
  parameters: {
    layout: 'centered',
  },
  args: {
    open: true,
    onOpenChange: fn(),
    tourNanoId: 'tour_123',
    tourTitle: 'Ancient Rome Tour',
    SlugSettings: MockSlugSettings,
  },
} satisfies Meta<typeof EditSlugDialog>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
