import { Body, Container, Head, Heading, Html, Img, Preview, Section, Tailwind, Text } from '@react-email/components'

export interface NewSignupNotificationEmailProps {
  userEmail: string
  signupDate: string
  logoUrl: string
}

export const NewSignupNotificationEmail = ({ userEmail, signupDate, logoUrl }: NewSignupNotificationEmailProps) => {
  const previewText = `${userEmail} has signed up and is waiting for approval.`

  const sql = `UPDATE studio.profiles SET status = 'approved', approved_at = now()\nWHERE id = (SELECT id FROM auth.users WHERE email = '${userEmail}');`

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
              New Signup Awaiting Approval
            </Heading>

            <Text className="text-black text-[14px] leading-[24px]">
              <strong>{userEmail}</strong> has signed up and is waiting for approval.
            </Text>

            <Text className="text-black text-[14px] leading-[24px]">Signed up: {signupDate}</Text>

            <Text className="text-black text-[14px] leading-[24px] font-semibold">Run this SQL to approve:</Text>

            <Section style={codeContainerStyle}>
              <Text style={codeStyle}>{sql}</Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

const codeContainerStyle = {
  background: 'rgba(0,0,0,.05)',
  borderRadius: '4px',
  margin: '16px auto 14px',
  padding: '12px 16px',
}

const codeStyle = {
  color: '#000',
  fontFamily: 'monospace',
  fontSize: '12px',
  lineHeight: '20px',
  margin: '0',
  whiteSpace: 'pre-wrap' as const,
  wordBreak: 'break-all' as const,
}

NewSignupNotificationEmail.PreviewProps = {
  userEmail: 'curator@museum.org',
  signupDate: '2026-02-10T14:30:00Z',
  logoUrl: '/static/demo-logo.png',
} as NewSignupNotificationEmailProps

export default NewSignupNotificationEmail
