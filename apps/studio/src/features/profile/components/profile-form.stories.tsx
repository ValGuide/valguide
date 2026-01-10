import type { Meta, StoryObj } from '@storybook/react'
import { ProfileForm } from './profile-form'

const mockOnSubmit = async () => {
  await new Promise((r) => setTimeout(r, 500))
  return { success: true }
}

const mockOnSuccess = async () => {
  console.log('Profile updated successfully')
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
    onSuccess: mockOnSuccess,
  },
  decorators: [
    (Story) => (
      <div className="w-[600px]">
        <Story />
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
    },
    isLoading: false,
  },
}

export const Empty: Story = {
  args: {
    profile: {
      username: null,
      firstName: null,
      lastName: null,
    },
    isLoading: false,
  },
}

export const PartialData: Story = {
  args: {
    profile: {
      username: 'johndoe',
      firstName: null,
      lastName: null,
    },
    isLoading: false,
  },
}
