import type { SupportedLocale } from '@valguide/core/i18n/i18n.config'

export type MaintenancePageI18n = {
  title: string
  description: string
  estimatedEnd: string
  retryHint: string
}

const maintenanceMessages: Record<SupportedLocale, MaintenancePageI18n> = {
  en: {
    title: "We'll be right back",
    description: 'We are currently performing maintenance to improve your experience.',
    estimatedEnd: 'Estimated completion: {time}',
    retryHint: 'Please retry in a couple of minutes.',
  },
  de: {
    title: 'Wir sind gleich wieder da',
    description: 'Wir führen derzeit Wartungsarbeiten durch, um Ihr Erlebnis zu verbessern.',
    estimatedEnd: 'Voraussichtliche Fertigstellung: {time}',
    retryHint: 'Bitte versuchen Sie es in ein paar Minuten erneut.',
  },
  rm: {
    title: 'Nus essan prest puspè qua',
    description: 'Nus faschain actualmain lavurs da mantegniment per meglierar tia experientscha.',
    estimatedEnd: 'Termin previsibel da finiziun: {time}',
    retryHint: 'Emprova per plaschair anc ina giada en intginas minutas.',
  },
}

export function getMaintenancePageI18n(locale: SupportedLocale): MaintenancePageI18n {
  return maintenanceMessages[locale]
}
