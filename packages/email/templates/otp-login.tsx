import { Body, Container, Head, Heading, Html, Preview, Section, Tailwind, Text } from '@react-email/components'
import type { ResendTemplateConfig } from './types'

export const otpLoginConfig: ResendTemplateConfig = {
  alias: 'otp-login',
  name: 'OTP Login',
  subject: 'Your ValGuide Login Code',
  from: 'ValGuide <noreply@valguide.com>',
  variables: [
    { key: 'CODE', type: 'string', fallbackValue: '000000' },
    { key: 'MAX_VALID_MINUTES', type: 'number', fallbackValue: 60 },
  ],
}

export const OtpLoginTemplate = () => {
  return (
    <Html>
      <Head />
      <Preview>Use the code below to securely log in. Valid for {'{{MAX_VALID_MINUTES}}'} minutes.</Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-white px-2 font-sans">
          <Container className="mx-auto my-[40px] max-w-[465px] rounded border border-solid border-[#eaeaea] p-[20px]">
            <Heading className="mx-0 my-[30px] p-0 text-center text-[24px] font-normal text-black">
              Your login code for <strong>ValGuide</strong>
            </Heading>

            <Section style={codeContainerStyle}>
              <Text style={codeStyle}>{'{{CODE}}'}</Text>
            </Section>

            <Text className="pt-2 text-center text-[16px] leading-[26px]">
              This code expires in {'{{MAX_VALID_MINUTES}}'} minutes.
            </Text>

            <Text className="pt-2 text-center text-[12px] leading-[26px]">
              If you didn't request this, please ignore this email.
            </Text>
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
  verticalAlign: 'middle' as const,
  width: '280px',
}

const codeStyle = {
  color: '#000',
  display: 'inline-block',
  fontFamily: 'HelveticaNeue-Bold',
  fontSize: '32px',
  fontWeight: 700,
  letterSpacing: '6px',
  lineHeight: '40px',
  paddingBottom: '8px',
  paddingTop: '8px',
  margin: '0 auto',
  width: '100%',
  textAlign: 'center' as const,
}

export const otpLoginText = `Your login code for ValGuide

{{CODE}}

This code expires in {{MAX_VALID_MINUTES}} minutes.

If you didn't request this, please ignore this email.`
