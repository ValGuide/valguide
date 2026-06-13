import type { Meta, StoryObj } from '@storybook/react'
import { getMaintenancePageI18n } from './i18n'
import { MaintenancePage } from './maintenance-page'

const meta: Meta<typeof MaintenancePage> = {
  title: 'System/Maintenance/MaintenancePage',
  component: MaintenancePage,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div className="min-h-svh bg-background px-4 py-8 text-foreground">
        <div className="mx-auto w-full max-w-2xl">
          <Story />
        </div>
      </div>
    ),
  ],
  args: {
    appName: 'ValGuide Studio',
    locale: 'en',
    i18n: getMaintenancePageI18n('en', 'studio'),
    message: null,
    eta: null,
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Studio: Story = {}

export const StudioWithEta: Story = {
  args: {
    eta: '2026-03-04 18:30',
  },
}

export const Visitors: Story = {
  args: {
    appName: 'ValGuide App',
    locale: 'en',
    i18n: getMaintenancePageI18n('en', 'app'),
    message: null,
    eta: null,
  },
}

export const VisitorsWithCustomMessage: Story = {
  args: {
    appName: 'ValGuide App',
    locale: 'en',
    i18n: getMaintenancePageI18n('en', 'app'),
    message: 'We are deploying an update and will be back shortly.',
    eta: '2026-03-04 19:15',
  },
}

export const StudioWithEtaGerman: Story = {
  args: {
    locale: 'de',
    i18n: getMaintenancePageI18n('de', 'studio'),
    eta: '2026-03-04 18:30',
  },
}
