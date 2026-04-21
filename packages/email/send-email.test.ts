import { type EmailTemplate, resolveSubject } from './send-email'

describe('resolveSubject', () => {
  it('resolves the team invite subject with the actual team name', () => {
    const template: EmailTemplate = {
      name: 'team-invite',
      data: {
        inviteLink: 'https://studio.valguide.com/join-team?invitationId=123',
        teamName: 'ValGuide Seed Data',
        inviterName: 'curator@museum-zurich.example',
        logoUrl: 'https://studio.valguide.com/icon.png',
      },
    }

    expect(resolveSubject(template, 'de')).toBe('Treten Sie ValGuide Seed Data auf ValGuide bei')
  })

  it('keeps static subjects unchanged for other email types', () => {
    const otpTemplate: EmailTemplate = {
      name: 'otp-login',
      data: {
        code: '123456',
        maxValidMinutes: 10,
        locale: 'en',
      },
    }

    const approvedTemplate: EmailTemplate = {
      name: 'account-approved',
      data: {
        studioUrl: 'https://studio.valguide.com',
        logoUrl: 'https://studio.valguide.com/icon.png',
        locale: 'en',
      },
    }

    expect(resolveSubject(otpTemplate, 'en')).toBe('Your ValGuide login code')
    expect(resolveSubject(approvedTemplate, 'en')).toBe('Your ValGuide account has been approved')
  })
})
