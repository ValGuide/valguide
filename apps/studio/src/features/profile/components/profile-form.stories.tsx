import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ProfileForm } from './profile-form'

const meta: Meta<typeof ProfileForm> = {
  title: 'Studio/Features/Profile/ProfileForm',
  component: ProfileForm,
  parameters: {
    nextjs: {
      appDirectory: true,
    },
    layout: 'centered',
    docs: {
      description: {
        component: 'Form for editing user profile information (username, first name, last name).',
      },
    },
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
    initialData: {
      username: 'johndoe',
      firstName: 'John',
      lastName: 'Doe',
    },
  },
}

export const Empty: Story = {
  args: {
    initialData: {},
  },
}

export const PartialData: Story = {
  args: {
    initialData: {
      username: 'johndoe',
    },
  },
}
