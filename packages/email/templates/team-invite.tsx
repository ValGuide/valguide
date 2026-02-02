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
import type { ResendTemplateConfig } from './types'

export const teamInviteConfig: ResendTemplateConfig = {
  alias: 'team-invite',
  name: 'Team Invite',
  subject: 'You have been invited to join {{{TEAM_NAME}}} on ValGuide',
  from: 'ValGuide <noreply@valguide.com>',
  variables: [
    { key: 'INVITE_LINK', type: 'string', fallbackValue: 'https://valguide.com' },
    { key: 'TEAM_NAME', type: 'string', fallbackValue: 'Team' },
    { key: 'INVITER_NAME', type: 'string', fallbackValue: 'Someone' },
  ],
}

export const TeamInviteTemplate = () => {
  return (
    <Html>
      <Head />
      <Preview>You have been invited to join {'{{{TEAM_NAME}}}'} on ValGuide.</Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-white px-2 font-sans">
          <Container className="mx-auto my-[40px] max-w-[465px] rounded border border-solid border-[#eaeaea] p-[20px]">
            <Heading className="mx-0 my-[30px] p-0 text-center text-[24px] font-normal text-black">
              Join <strong>{'{{{TEAM_NAME}}}'}</strong> on <strong>ValGuide</strong>
            </Heading>

            <Text className="text-[14px] leading-[24px] text-black">Hello,</Text>

            <Text className="text-[14px] leading-[24px] text-black">
              <strong>{'{{{INVITER_NAME}}}'}</strong> has invited you to join the <strong>{'{{{TEAM_NAME}}}'}</strong>{' '}
              team on ValGuide.
            </Text>

            <Section className="mb-[32px] mt-[32px] text-center">
              <Button
                className="rounded bg-[#000000] px-5 py-3 text-center text-[12px] font-semibold text-white no-underline"
                href="{{{INVITE_LINK}}}"
              >
                Join Team
              </Button>
            </Section>

            <Text className="text-[14px] leading-[24px] text-black">
              or copy and paste this URL into your browser:
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

export const teamInviteText = `Join {{{TEAM_NAME}}} on ValGuide

Hello,

{{{INVITER_NAME}}} has invited you to join the {{{TEAM_NAME}}} team on ValGuide.

Join Team: {{{INVITE_LINK}}}`
