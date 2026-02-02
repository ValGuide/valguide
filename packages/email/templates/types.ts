export interface ResendTemplateVariable {
  key: string
  type: 'string' | 'number' | 'boolean'
  fallbackValue: string | number | boolean
}

export interface ResendTemplateConfig {
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
