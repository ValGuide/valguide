import { defaultEmailLocale, type EmailLocale } from './locales'

interface OtpLoginCopy {
  subject: string
  preview: (maxValidMinutes: string | number) => string
  heading: string
  expires: (maxValidMinutes: string | number) => string
  ignore: string
}

interface TeamInviteCopy {
  subject: (teamName: string) => string
  preview: (teamName: string) => string
  heading: (teamName: string) => string
  greeting: string
  invitedBy: (inviterName: string, teamName: string) => string
  cta: string
  copyUrl: string
}

const otpLoginCopyByLocale: Record<EmailLocale, OtpLoginCopy> = {
  en: {
    subject: 'Your ValGuide login code',
    preview: (maxValidMinutes) => `Use the code below to securely log in. Valid for ${maxValidMinutes} minutes.`,
    heading: 'Your login code for ValGuide',
    expires: (maxValidMinutes) => `This code expires in ${maxValidMinutes} minutes.`,
    ignore: "If you didn't request this, please ignore this email.",
  },
  de: {
    subject: 'Ihr ValGuide-Anmeldecode',
    preview: (maxValidMinutes) =>
      `Verwenden Sie den folgenden Code für die sichere Anmeldung. Gültig für ${maxValidMinutes} Minuten.`,
    heading: 'Ihr Anmeldecode für ValGuide',
    expires: (maxValidMinutes) => `Dieser Code läuft in ${maxValidMinutes} Minuten ab.`,
    ignore: 'Falls Sie dies nicht angefordert haben, ignorieren Sie diese E-Mail bitte.',
  },
  rm: {
    subject: "Vies code d'annunzia per ValGuide",
    preview: (maxValidMinutes) =>
      `Utilisei il code sutvart per As annunziar a moda segira. Valabel per ${maxValidMinutes} minutas.`,
    heading: "Vies code d'annunzia per ValGuide",
    expires: (maxValidMinutes) => `Quest code scada en ${maxValidMinutes} minutas.`,
    ignore: "Sche Vus n'avais betg dumandà quai, ignorai per plaschair quest e-mail.",
  },
}

const teamInviteCopyByLocale: Record<EmailLocale, TeamInviteCopy> = {
  en: {
    subject: (teamName) => `Join ${teamName} on ValGuide`,
    preview: (teamName) => `You have been invited to join ${teamName} on ValGuide.`,
    heading: (teamName) => `Join ${teamName} on ValGuide`,
    greeting: 'Hello,',
    invitedBy: (inviterName, teamName) => `${inviterName} has invited you to join the ${teamName} team on ValGuide.`,
    cta: 'Join Team',
    copyUrl: 'or copy and paste this URL into your browser:',
  },
  de: {
    subject: (teamName) => `Treten Sie ${teamName} auf ValGuide bei`,
    preview: (teamName) => `Sie wurden eingeladen, ${teamName} auf ValGuide beizutreten.`,
    heading: (teamName) => `${teamName} auf ValGuide beitreten`,
    greeting: 'Hallo,',
    invitedBy: (inviterName, teamName) =>
      `${inviterName} hat Sie eingeladen, dem Team ${teamName} auf ValGuide beizutreten.`,
    cta: 'Team beitreten',
    copyUrl: 'oder kopieren Sie diese URL in Ihren Browser:',
  },
  rm: {
    subject: (teamName) => `As participai a ${teamName} sin ValGuide`,
    preview: (teamName) => `Vus essas vegnì envidà da participar a ${teamName} sin ValGuide.`,
    heading: (teamName) => `Participar a ${teamName} sin ValGuide`,
    greeting: 'Bun di,',
    invitedBy: (inviterName, teamName) => `${inviterName} As ha envidà da participar al team ${teamName} sin ValGuide.`,
    cta: 'Participar al team',
    copyUrl: 'u copiar questa URL en Voss navigatur:',
  },
}

export function getOtpLoginCopy(locale: EmailLocale): OtpLoginCopy {
  return otpLoginCopyByLocale[locale] ?? otpLoginCopyByLocale[defaultEmailLocale]
}

export function getTeamInviteCopy(locale: EmailLocale): TeamInviteCopy {
  return teamInviteCopyByLocale[locale] ?? teamInviteCopyByLocale[defaultEmailLocale]
}
