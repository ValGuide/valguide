import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components'
import { getTeamInviteCopy } from './copy'
import { defaultEmailLocale, type EmailLocale } from './locales'
import type { ResendTemplateConfig } from './types'

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

export const TeamInviteTemplate = ({ locale = defaultEmailLocale }: { locale?: EmailLocale }) => {
  const copy = getTeamInviteCopy(locale)

  return (
    <Html>
      <Head />
      <Preview>{copy.preview('{{{TEAM_NAME}}}')}</Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-white px-2 font-sans">
          <Container className="mx-auto my-[40px] max-w-[465px] rounded border border-solid border-[#eaeaea] p-[20px]">
            <Heading className="mx-0 my-[30px] p-0 text-center text-[24px] font-normal text-black">
              {copy.heading('{{{TEAM_NAME}}}')}
            </Heading>

            <Text className="text-[14px] leading-[24px] text-black">{copy.greeting}</Text>

            <Text className="text-[14px] leading-[24px] text-black">
              {copy.invitedBy('{{{INVITER_NAME}}}', '{{{TEAM_NAME}}}')}
            </Text>

            <Section className="mb-[32px] mt-[32px] text-center">
              <Button
                className="rounded bg-[#000000] px-5 py-3 text-center text-[12px] font-semibold text-white no-underline"
                href="{{{INVITE_LINK}}}"
              >
                {copy.cta}
              </Button>
            </Section>

            <Text className="text-[14px] leading-[24px] text-black">
              {copy.copyUrl}
              <br />
              <Link href="{{{INVITE_LINK}}}" className="text-blue-600 no-underline">
                {'{{{INVITE_LINK}}}'}
              </Link>
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

export function getTeamInviteText(locale: EmailLocale): string {
  const copy = getTeamInviteCopy(locale)
  return `${copy.heading('{{{TEAM_NAME}}}')}

${copy.greeting}

${copy.invitedBy('{{{INVITER_NAME}}}', '{{{TEAM_NAME}}}')}

${copy.cta}: {{{INVITE_LINK}}}`
}
