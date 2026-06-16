import { env } from '../env'
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
    from: env.EMAIL_FROM,
    variables: [
      { key: 'INVITE_LINK', type: 'string', fallbackValue: 'https://valguide.com' },
      { key: 'TEAM_NAME', type: 'string', fallbackValue: 'Team' },
      { key: 'INVITER_NAME', type: 'string', fallbackValue: 'Someone' },
      { key: 'LOGO_URL', type: 'string', fallbackValue: 'https://studio.valguide.com/icon.png' },
    ],
  }
}
