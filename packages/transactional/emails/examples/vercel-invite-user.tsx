import {
  Body,
  Button,
  Container,
  Column,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
  Tailwind,
} from '@react-email/components'
import * as React from 'react'

export interface VercelInviteUserEmailTranslations {
  preview: string
  heading: React.ReactNode
  greeting: React.ReactNode
  invitation: React.ReactNode
  button: string
  copyLink: string
  footer: {
    intendedFor: React.ReactNode
    ignore: string
    concern: string
  }
}

interface VercelInviteUserEmailProps {
  username?: string
  userImage?: string
  invitedByUsername?: string
  invitedByEmail?: string
  teamName?: string
  teamImage?: string
  inviteLink?: string
  inviteFromIp?: string
  inviteFromLocation?: string
  translations?: VercelInviteUserEmailTranslations
}

const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : ''

export const VercelInviteUserEmail = ({
  username,
  userImage,
  invitedByUsername,
  invitedByEmail,
  teamName,
  teamImage,
  inviteLink,
  inviteFromIp,
  inviteFromLocation,
  translations,
}: VercelInviteUserEmailProps) => {
  const t = translations || {
    preview: `Join ${invitedByUsername} on Vercel`,
    heading: (
      <>
        Join <strong>{teamName}</strong> on <strong>Vercel</strong>
      </>
    ),
    greeting: `Hello ${username},`,
    invitation: (
      <>
        <strong>{invitedByUsername}</strong> (
        <Link href={`mailto:${invitedByEmail}`} className="text-blue-600 no-underline">
          {invitedByEmail}
        </Link>
        ) has invited you to the <strong>{teamName}</strong> team on <strong>Vercel</strong>.
      </>
    ),
    button: 'Join the team',
    copyLink: 'or copy and paste this URL into your browser:',
    footer: {
      intendedFor: (
        <>
          This invitation was intended for <span className="text-black">{username}</span>. This invite was sent from{' '}
          <span className="text-black">{inviteFromIp}</span> located in{' '}
          <span className="text-black">{inviteFromLocation}</span>.
        </>
      ),
      ignore: 'If you were not expecting this invitation, you can ignore this email.',
      concern: "If you are concerned about your account's safety, please reply to this email to get in touch with us.",
    },
  }

  return (
    <Html>
      <Head />
      <Preview>{t.preview}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans px-2">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
            <Section className="mt-[32px]">
              <Img
                src={`${baseUrl}/static/vercel-logo.png`}
                width="40"
                height="37"
                alt="Vercel"
                className="my-0 mx-auto"
              />
            </Section>
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              {t.heading}
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">{t.greeting}</Text>
            <Text className="text-black text-[14px] leading-[24px]">{t.invitation}</Text>
            <Section>
              <Row>
                <Column align="right">
                  <Img className="rounded-full" src={userImage} width="64" height="64" />
                </Column>
                <Column align="center">
                  <Img src={`${baseUrl}/static/vercel-arrow.png`} width="12" height="9" alt="invited you to" />
                </Column>
                <Column align="left">
                  <Img className="rounded-full" src={teamImage} width="64" height="64" />
                </Column>
              </Row>
            </Section>
            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                href={inviteLink}
              >
                {t.button}
              </Button>
            </Section>
            <Text className="text-black text-[14px] leading-[24px]">
              {t.copyLink}{' '}
              <Link href={inviteLink} className="text-blue-600 no-underline">
                {inviteLink}
              </Link>
            </Text>
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              {t.footer.intendedFor} {t.footer.ignore} {t.footer.concern}
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

VercelInviteUserEmail.PreviewProps = {
  username: 'alanturing',
  userImage: `${baseUrl}/static/vercel-user.png`,
  invitedByUsername: 'Alan',
  invitedByEmail: 'alan.turing@example.com',
  teamName: 'Enigma',
  teamImage: `${baseUrl}/static/vercel-team.png`,
  inviteLink: 'https://vercel.com/teams/invite/foo',
  inviteFromIp: '204.13.186.218',
  inviteFromLocation: 'São Paulo, Brazil',
} as VercelInviteUserEmailProps

export default VercelInviteUserEmail
