import { Body, Container, Head, Heading, Html, Img, Preview, Section, Tailwind, Text } from '@react-email/components'
import { getOtpLoginCopy } from '../templates/copy'
import { defaultEmailLocale, type EmailLocale } from '../templates/locales'

export interface OtpLoginEmailProps {
  code: string
  maxValidMinutes: number
  logoUrl?: string
  locale?: EmailLocale
}

export const OtpLoginEmail = ({ code, maxValidMinutes, logoUrl, locale = defaultEmailLocale }: OtpLoginEmailProps) => {
  const copy = getOtpLoginCopy(locale)
  const previewText = copy.preview(maxValidMinutes)

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans px-2">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px] ">
            {logoUrl && (
              <Section className="mt-[32px] justify-center items-center text-center">
                <Img src={logoUrl} width="42" height="42" alt="ValGuide" className="my-0 mx-auto" />
              </Section>
            )}
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              {copy.heading}
            </Heading>

            <Section style={codeContainerStyle}>
              <Text style={codeStyle}>{code}</Text>
            </Section>

            <Text className="pt-2 text-center leading-[26px] text-[16px]">{copy.expires(maxValidMinutes)}</Text>

            <Text className="pt-2 text-center leading-[26px] text-[12px]">{copy.ignore}</Text>
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
  maxValidMinutes: 60,
  locale: 'en',
} as OtpLoginEmailProps

export default OtpLoginEmail
