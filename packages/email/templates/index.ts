import { OtpLoginTemplate, otpLoginConfig, otpLoginText } from './otp-login'
import { TeamInviteTemplate, teamInviteConfig, teamInviteText } from './team-invite'
import type { ResendTemplate } from './types'

export type { ResendTemplate, ResendTemplateConfig, ResendTemplateVariable } from './types'

export const templates: ResendTemplate[] = [
  { config: otpLoginConfig, component: OtpLoginTemplate, text: otpLoginText },
  { config: teamInviteConfig, component: TeamInviteTemplate, text: teamInviteText },
]

export { OtpLoginTemplate, otpLoginConfig }
export { TeamInviteTemplate, teamInviteConfig }
