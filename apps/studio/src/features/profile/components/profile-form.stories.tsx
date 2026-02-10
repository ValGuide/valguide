import type { Meta, StoryObj } from '@storybook/react'
import { Card, CardContent, CardHeader, CardTitle } from '@valguide/ui/components/card'
import { ProfileForm } from './profile-form'

const mockOnSubmit = async () => {
  await new Promise((r) => setTimeout(r, 500))
  return { success: true }
}

const meta: Meta<typeof ProfileForm> = {
  title: 'Studio/Features/Profile/ProfileForm',
  component: ProfileForm,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Form for editing user profile information (username, first name, last name).',
      },
    },
  },
  args: {
    onSubmit: mockOnSubmit,
    email: 'john@museum.org',
  },
  decorators: [
    (Story) => (
      <div className="w-[600px]">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <Story />
          </CardContent>
        </Card>
      </div>
    ),
  ],
}

export default meta

type Story = StoryObj<typeof ProfileForm>

export const Default: Story = {
  args: {
    profile: {
      username: 'johndoe',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+41791234567',
    },
  },
}

export const Empty: Story = {
  args: {
    profile: {
      username: null,
      firstName: null,
      lastName: null,
      phone: null,
    },
  },
}

export const PartialData: Story = {
  args: {
    profile: {
      username: 'johndoe',
      firstName: null,
      lastName: null,
      phone: null,
    },
  },
}
