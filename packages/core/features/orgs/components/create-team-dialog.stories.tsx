import type { Meta, StoryObj } from '@storybook/react'
import { Button } from '@valguide/ui/components/button'
import * as React from 'react'
import { CreateTeamDialog } from './create-team-dialog'

const mockOnCreateTeam = async (name: string) => {
    console.log('Creating team:', { name })
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return { success: true as const, team: { id: '123', name } }
}

const meta = {
    title: 'Features/Orgs/CreateTeamDialog',
    component: CreateTeamDialog,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    args: {
        onCreateTeam: mockOnCreateTeam,
    },
} satisfies Meta<typeof CreateTeamDialog>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    render: (args) => <CreateTeamDialog {...args} />,
}

export const WithCustomTrigger: Story = {
    render: (args) => (
        <CreateTeamDialog {...args}>
            <Button variant="secondary">Custom Trigger Button</Button>
        </CreateTeamDialog>
    ),
}

export const Controlled: Story = {
    render: (args) => {
        const [open, setOpen] = React.useState(false)
        return (
            <div className="flex flex-col items-center gap-4">
                <p>State: {open ? 'Open' : 'Closed'}</p>
                <Button onClick={() => setOpen(true)}>Open Dialog</Button>
                <CreateTeamDialog {...args} open={open} onOpenChange={setOpen} />
            </div>
        )
    },
}


