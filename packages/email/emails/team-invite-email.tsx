import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components'

export interface TeamInviteEmailProps {
  inviteLink: string
  teamName: string
  inviterName: string
  logoUrl: string
}

export const TeamInviteEmail = ({ inviteLink, teamName, inviterName, logoUrl }: TeamInviteEmailProps) => {
  const previewText = `You have been invited to join ${teamName} on ValGuide.`

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans px-2">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px] ">
            <Section className="mt-[32px] justify-center items-center text-center">
              <Img src={logoUrl} width="42" height="42" alt="ValGuide" className="my-0 mx-auto" />
            </Section>
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Join <strong>{teamName}</strong> on <strong>ValGuide</strong>
            </Heading>

            <Text className="text-black text-[14px] leading-[24px]">Hello,</Text>

            <Text className="text-black text-[14px] leading-[24px]">
              <strong>{inviterName}</strong> has invited you to join the <strong>{teamName}</strong> team on ValGuide.
            </Text>

            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                href={inviteLink}
              >
                Join Team
              </Button>
            </Section>

            <Text className="text-black text-[14px] leading-[24px]">
              or copy and paste this URL into your browser:
              <br />
              <a href={inviteLink} className="text-blue-600 no-underline">
                {inviteLink}
              </a>
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

TeamInviteEmail.PreviewProps = {
  inviteLink: 'https://valguide.com/join-team?token=123',
  teamName: 'Acme Corp',
  inviterName: 'Alice',
  logoUrl: '/static/demo-logo.png',
} as TeamInviteEmailProps

export default TeamInviteEmail
