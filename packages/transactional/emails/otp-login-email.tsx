import { Body, Container, Head, Heading, Html, Img, Preview, Section, Tailwind, Text } from '@react-email/components'
import * as React from 'react'

export interface OtpLoginEmailProps {
  code: string
  maxValidMinutes: number
  logoUrl: string
}

export const OtpLoginEmail = ({ code, maxValidMinutes, logoUrl }: OtpLoginEmailProps) => {
  const previewText = `Use the code below to securely log in. Valid for ${maxValidMinutes} minutes.`

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans px-2">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px] ">
            <Section className="mt-[32px] justify-center items-center text-center">
              <Img src={logoUrl} width="42" height="42" alt="Demo" className="my-0 mx-auto" />
            </Section>
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Your login code for <strong>Demo</strong>
            </Heading>

            <Section style={codeContainerStyle}>
              <Text style={codeStyle}>{code}</Text>
            </Section>

            <Text className="pt-2 text-center leading-[26px] text-[16px]">
              This code expires in {maxValidMinutes} minutes.
            </Text>

            <Text className="pt-2 text-center leading-[26px] text-[12px]">
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
  verticalAlign: 'middle',
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

OtpLoginEmail.PreviewProps = {
  code: '512345',
  maxValidMinutes: 3,
  logoUrl: `/static/demo-logo.png`,
} as OtpLoginEmailProps

export default OtpLoginEmail
