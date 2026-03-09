import React from 'react'
import { emailLocales } from '../templates/locales'
import type { ResendTemplate } from '../templates/types'
import { AccountApprovedEmail } from './account-approved-email'
import { getAccountApprovedConfig, getAccountApprovedText } from './account-approved-template'
import { OtpLoginEmail } from './otp-login-email'
import { getOtpLoginConfig, getOtpLoginText } from './otp-login-template'
import { TeamInviteEmail } from './team-invite-email'
import { getTeamInviteConfig, getTeamInviteText } from './team-invite-template'

export const templates: ResendTemplate[] = emailLocales.flatMap((locale) => [
  {
    config: getAccountApprovedConfig(locale),
    component: () =>
      React.createElement(AccountApprovedEmail, {
        studioUrl: '{{{STUDIO_URL}}}',
        logoUrl: '{{{LOGO_URL}}}',
        locale,
      }),
    text: getAccountApprovedText(locale),
  },
  {
    config: getOtpLoginConfig(locale),
    component: () => React.createElement(OtpLoginEmail, { code: '{{{CODE}}}', maxValidMinutes: 60, locale }),
    text: getOtpLoginText(locale),
  },
  {
    config: getTeamInviteConfig(locale),
    component: () =>
      React.createElement(TeamInviteEmail, {
        inviteLink: '{{{INVITE_LINK}}}',
        teamName: '{{{TEAM_NAME}}}',
        inviterName: '{{{INVITER_NAME}}}',
        logoUrl: '/static/demo-logo.png',
        locale,
      }),
    text: getTeamInviteText(locale),
  },
])
