import type { Meta, StoryObj } from '@storybook/react'
import { Button } from '@valguide/ui/components/button'
import { UserPlus } from 'lucide-react'
import { InviteMemberDialog } from './invite-member-dialog'

const meta: Meta<typeof InviteMemberDialog> = {
  title: 'Core/Orgs/InviteMemberDialog',
  component: InviteMemberDialog,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Dialog for inviting new team members via email. Shows available roles based on current user permissions and provides role descriptions.',
      },
    },
  },
}

export default meta

type Story = StoryObj<typeof InviteMemberDialog>

export const AsOwner: Story = {
  args: {
    currentUserRole: 'owner',
  },
  parameters: {
    docs: {
      description: {
        story: 'Invite dialog as Owner. Can assign any role except Owner.',
      },
    },
  },
}

export const AsAdmin: Story = {
  args: {
    currentUserRole: 'admin',
  },
  parameters: {
    docs: {
      description: {
        story: 'Invite dialog as Admin. Can assign Curator, Editor, or Viewer roles.',
      },
    },
  },
}

export const AsCurator: Story = {
  args: {
    currentUserRole: 'curator',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Invite dialog as Curator. Can only assign Editor or Viewer roles (though Curators typically cannot invite).',
      },
    },
  },
}

export const WithCustomTrigger: Story = {
  args: {
    currentUserRole: 'owner',
    children: (
      <Button variant="outline" size="sm">
        <UserPlus className="mr-2 size-4" />
        Add team member
      </Button>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Invite dialog with custom trigger button.',
      },
    },
  },
}

export const ControlledOpen: Story = {
  args: {
    currentUserRole: 'admin',
    open: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Controlled dialog that is open by default (for testing/screenshots).',
      },
    },
  },
}

export const WithError: Story = {
  args: {
    currentUserRole: 'owner',
    onInvite: async () => {
      await new Promise((resolve) => setTimeout(resolve, 500))
      throw new Error('This email is already a team member')
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Invite dialog that shows error state when invitation fails.',
      },
    },
  },
  play: async () => {
    // This would auto-trigger the dialog for testing
  },
}

export const SlowSubmission: Story = {
  args: {
    currentUserRole: 'admin',
    onInvite: async () => {
      await new Promise((resolve) => setTimeout(resolve, 3000))
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Invite dialog with slow submission to show loading state.',
      },
    },
  },
}
