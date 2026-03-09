import { getTeamInviteCopy } from '../templates/copy'
import type { EmailLocale } from '../templates/locales'
import type { ResendTemplateConfig } from '../templates/types'

export function getTeamInviteConfig(locale: EmailLocale): ResendTemplateConfig {
  return {
    key: 'team-invite',
    locale,
    alias: `team-invite-${locale}`,
    name: `Team Invite (${locale.toUpperCase()})`,
    subject: getTeamInviteCopy(locale).subject('{{{TEAM_NAME}}}'),
    from: 'ValGuide <noreply@valguide.com>',
    variables: [
      { key: 'INVITE_LINK', type: 'string', fallbackValue: 'https://valguide.com' },
      { key: 'TEAM_NAME', type: 'string', fallbackValue: 'Team' },
      { key: 'INVITER_NAME', type: 'string', fallbackValue: 'Someone' },
    ],
  }
}

export function getTeamInviteText(locale: EmailLocale): string {
  const copy = getTeamInviteCopy(locale)
  return `${copy.heading('{{{TEAM_NAME}}}')}

${copy.greeting}

${copy.invitedBy('{{{INVITER_NAME}}}', '{{{TEAM_NAME}}}')}

${copy.cta}: {{{INVITE_LINK}}}`
}
