import type { Meta, StoryObj } from '@storybook/react'
import { getMaintenancePageI18n } from './i18n'
import { MaintenancePage } from './maintenance-page'

const meta: Meta<typeof MaintenancePage> = {
  title: 'Maintenance/MaintenancePage',
  component: MaintenancePage,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          padding: '24px',
          background: 'linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)',
        }}
      >
        <div style={{ width: 'min(640px, 100%)' }}>
          <Story />
        </div>
      </div>
    ),
  ],
  args: {
    appName: 'ValGuide Studio',
    i18n: getMaintenancePageI18n('en'),
    message: null,
    eta: null,
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithEta: Story = {
  args: {
    eta: '2026-03-04 18:30',
  },
}

export const WithCustomMessage: Story = {
  args: {
    appName: 'ValGuide App',
    message: 'We are deploying an update and will be back shortly.',
    eta: '2026-03-04 19:15',
  },
}
