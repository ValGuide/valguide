import deMessages from '../messages/de.json'
import enMessages from '../messages/en.json'
import rmMessages from '../messages/rm.json'
import { defaultEmailLocale, type EmailLocale } from './locales'

type EmailMessages = typeof enMessages

type OtpLoginCopy = {
  subject: string
  preview: (maxValidMinutes: string | number) => string
  heading: string
  expires: (maxValidMinutes: string | number) => string
  ignore: string
}

type TeamInviteCopy = {
  subject: (teamName: string) => string
  preview: (teamName: string) => string
  heading: (teamName: string) => string
  greeting: string
  invitedBy: (inviterName: string, teamName: string) => string
  cta: string
  copyUrl: string
}

type AccountApprovedCopy = {
  subject: string
  preview: string
  heading: string
  body: string
  cta: string
  copyUrl: string
}

const messagesByLocale: Record<EmailLocale, EmailMessages> = {
  en: enMessages,
  de: deMessages,
  rm: rmMessages,
}

function getMessages(locale: EmailLocale): EmailMessages {
  return messagesByLocale[locale] ?? messagesByLocale[defaultEmailLocale]
}

function interpolate(template: string, values: Record<string, string | number>): string {
  let result = template

  for (const [key, value] of Object.entries(values)) {
    result = result.replaceAll(`{${key}}`, String(value))
  }

  return result
}

export function getOtpLoginCopy(locale: EmailLocale): OtpLoginCopy {
  const copy = getMessages(locale).otpLogin

  return {
    subject: copy.subject,
    preview: (maxValidMinutes) => interpolate(copy.preview, { maxValidMinutes }),
    heading: copy.heading,
    expires: (maxValidMinutes) => interpolate(copy.expires, { maxValidMinutes }),
    ignore: copy.ignore,
  }
}

export function getTeamInviteCopy(locale: EmailLocale): TeamInviteCopy {
  const copy = getMessages(locale).teamInvite

  return {
    subject: (teamName) => interpolate(copy.subject, { teamName }),
    preview: (teamName) => interpolate(copy.preview, { teamName }),
    heading: (teamName) => interpolate(copy.heading, { teamName }),
    greeting: copy.greeting,
    invitedBy: (inviterName, teamName) => interpolate(copy.invitedBy, { inviterName, teamName }),
    cta: copy.cta,
    copyUrl: copy.copyUrl,
  }
}

export function getAccountApprovedCopy(locale: EmailLocale): AccountApprovedCopy {
  const copy = getMessages(locale).accountApproved

  return {
    subject: copy.subject,
    preview: copy.preview,
    heading: copy.heading,
    body: copy.body,
    cta: copy.cta,
    copyUrl: copy.copyUrl,
  }
}
