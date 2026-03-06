import type { EmailLocale } from './locales'

export type EmailTemplateKey = 'otp-login' | 'team-invite'

export type ResendTemplateVariable =
  | {
      key: string
      type: 'string'
      fallbackValue: string
    }
  | {
      key: string
      type: 'number'
      fallbackValue: number
    }

export interface ResendTemplateConfig {
  key: EmailTemplateKey
  locale: EmailLocale
  alias: string
  name: string
  subject: string
  from: string
  variables: ResendTemplateVariable[]
}

export interface ResendTemplate {
  config: ResendTemplateConfig
  component: React.ComponentType
  text: string
}
