import type { StoryObj } from '@storybook/react'
import { OtpInput } from '@valguide/ui/inputs/opt-input'
import { userEvent, within } from '@storybook/test'
import { delay } from '@valguide/core/utils/delay'
import { createLogger } from '@valguide/logger'
import Loading from '@/app/[locale]/(auth)/login/loading'
import { EmailLoginFormServer } from '@/app/[locale]/(auth)/login/email/email-login-form.server'
import { EmailLoginProvider } from '@/app/[locale]/(auth)/login/email/email-login.provider'

const log = createLogger('login-email-stories')

const stories = {
  title: 'Login/Email',
  parameters: {
    layout: 'fullscreen',
  },
}

export default stories

export const Primary: StoryObj = {
  args: {},
  render: (args) => (
    <div className="h-dvh flex flex-1 justify-center items-center">
      <EmailLoginProvider
        onSubmit={async () => {
          log.info('onSubmit')
        }}
      >
        <EmailLoginFormServer {...args} />
      </EmailLoginProvider>
    </div>
  ),
}

export const ServerError: StoryObj = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const emailInput = canvas.getByTestId('email-input')
    await userEvent.click(emailInput, { delay: 200 })
    await userEvent.type(emailInput, 'valerius@valguide.com', { delay: 50 })
    await userEvent.click(canvas.getByTestId('submit-button'))
  },
  render: (args) => (
    <div className="h-dvh flex justify-center items-center">
      <EmailLoginProvider
        onSubmit={async () => {
          await delay(1000)
          throw new Error('Server Error')
        }}
      >
        <EmailLoginFormServer {...args} />
      </EmailLoginProvider>
    </div>
  ),
}

export const LoadingStory: StoryObj = {
  name: 'Loading',
  render: () => <Loading />,
}

export const Verify: StoryObj = {
  args: {},
  render: () => (
    <div className="h-dvh flex justify-center items-center">
      <OtpInput
        disabled={false}
        onComplete={async (code) => {
          log.info('code', code)
        }}
      />
    </div>
  ),
}
