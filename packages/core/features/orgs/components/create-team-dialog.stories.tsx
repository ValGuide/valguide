import type { Meta, StoryObj } from '@storybook/react'
import { Button } from '@valguide/ui/components/button'
import { CreateTeamDialog } from './create-team-dialog'

const meta = {
  title: 'Features/Orgs/CreateTeamDialog',
  component: CreateTeamDialog,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CreateTeamDialog>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <CreateTeamDialog />,
}

export const WithCustomTrigger: Story = {
  render: () => (
    <CreateTeamDialog>
      <Button variant="secondary">Custom Trigger Button</Button>
    </CreateTeamDialog>
  ),
}

export const Controlled: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [open, setOpen] = React.useState(false)
    return (
      <div className="flex flex-col items-center gap-4">
        <p>State: {open ? 'Open' : 'Closed'}</p>
        <Button onClick={() => setOpen(true)}>Open Dialog</Button>
        <CreateTeamDialog open={open} onOpenChange={setOpen} />
      </div>
    )
  },
}

import * as React from 'react'
