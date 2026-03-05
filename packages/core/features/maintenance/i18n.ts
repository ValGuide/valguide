import type { SupportedLocale } from '@valguide/core/i18n/i18n.config'
import deMessages from '@valguide/core/i18n/messages/de.json'
import enMessages from '@valguide/core/i18n/messages/en.json'
import rmMessages from '@valguide/core/i18n/messages/rm.json'
import type { MaintenanceApp } from './types'

export type MaintenancePageI18n = {
  label: string
  status: string
  title: string
  description: string
  estimatedEnd: string
  retryHint: string
  retryAction: string
  reassuranceOne: string
  reassuranceTwo: string
  reassuranceThree: string
}

type MaintenanceI18nMessages = {
  maintenance?: {
    shared?: {
      status?: string
      estimatedEnd?: string
      retryHint?: string
      retryAction?: string
    }
    studio?: {
      label?: string
      title?: string
      description?: string
      reassuranceOne?: string
      reassuranceTwo?: string
      reassuranceThree?: string
    }
    app?: {
      label?: string
      title?: string
      description?: string
      reassuranceOne?: string
      reassuranceTwo?: string
      reassuranceThree?: string
    }
  }
}

const messageByLocale: Record<SupportedLocale, MaintenanceI18nMessages> = {
  en: enMessages,
  de: deMessages,
  rm: rmMessages,
}

const englishFallbackMessages: Record<MaintenanceApp, MaintenancePageI18n> = {
  studio: {
    label: 'Studio maintenance in progress',
    status: 'Service temporarily unavailable',
    title: "We'll be right back",
    description: 'ValGuide Studio is currently under maintenance to improve curator workflows.',
    estimatedEnd: 'Estimated completion: {time}',
    retryHint: 'Please retry in a couple of minutes.',
    retryAction: 'Retry now',
    reassuranceOne: 'Your drafts and published content remain safe.',
    reassuranceTwo: 'No action is required from your side.',
    reassuranceThree: 'You can retry at any time.',
  },
  app: {
    label: 'Service update in progress',
    status: 'Service temporarily unavailable',
    title: "We'll be back shortly",
    description: 'ValGuide App is currently being updated to improve your visit experience.',
    estimatedEnd: 'Estimated completion: {time}',
    retryHint: 'Please retry in a couple of minutes.',
    retryAction: 'Retry now',
    reassuranceOne: 'Your tour access and content will be available again once maintenance is done.',
    reassuranceTwo: 'No action is required from your side.',
    reassuranceThree: 'You can retry at any time.',
  },
}

export function getMaintenancePageI18n(locale: SupportedLocale, app: MaintenanceApp): MaintenancePageI18n {
  const fallback = englishFallbackMessages[app]
  const messages = messageByLocale[locale]
  const shared = messages.maintenance?.shared
  const appSpecific = app === 'studio' ? messages.maintenance?.studio : messages.maintenance?.app

  return {
    label: appSpecific?.label ?? fallback.label,
    status: shared?.status ?? fallback.status,
    title: appSpecific?.title ?? fallback.title,
    description: appSpecific?.description ?? fallback.description,
    estimatedEnd: shared?.estimatedEnd ?? fallback.estimatedEnd,
    retryHint: shared?.retryHint ?? fallback.retryHint,
    retryAction: shared?.retryAction ?? fallback.retryAction,
    reassuranceOne: appSpecific?.reassuranceOne ?? fallback.reassuranceOne,
    reassuranceTwo: appSpecific?.reassuranceTwo ?? fallback.reassuranceTwo,
    reassuranceThree: appSpecific?.reassuranceThree ?? fallback.reassuranceThree,
  }
}
