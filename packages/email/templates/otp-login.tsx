import { Body, Container, Head, Heading, Html, Preview, Section, Tailwind, Text } from '@react-email/components'
import { getOtpLoginCopy } from './copy'
import { defaultEmailLocale, type EmailLocale } from './locales'
import type { ResendTemplateConfig } from './types'

export function getOtpLoginConfig(locale: EmailLocale): ResendTemplateConfig {
  return {
    key: 'otp-login',
    locale,
    alias: `otp-login-${locale}`,
    name: `OTP Login (${locale.toUpperCase()})`,
    subject: getOtpLoginCopy(locale).subject,
    from: 'ValGuide <noreply@valguide.com>',
    variables: [
      { key: 'CODE', type: 'string', fallbackValue: '000000' },
      { key: 'MAX_VALID_MINUTES', type: 'number', fallbackValue: 60 },
    ],
  }
}

export const OtpLoginTemplate = ({ locale = defaultEmailLocale }: { locale?: EmailLocale }) => {
  const copy = getOtpLoginCopy(locale)

  return (
    <Html>
      <Head />
      <Preview>{copy.preview('{{{MAX_VALID_MINUTES}}}')}</Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-white px-2 font-sans">
          <Container className="mx-auto my-[40px] max-w-[465px] rounded border border-solid border-[#eaeaea] p-[20px]">
            <Heading className="mx-0 my-[30px] p-0 text-center text-[24px] font-normal text-black">
              {copy.heading}
            </Heading>

            <Section style={codeContainerStyle}>
              <Text style={codeStyle}>{'{{{CODE}}}'}</Text>
            </Section>

            <Text className="pt-2 text-center text-[16px] leading-[26px]">
              {copy.expires('{{{MAX_VALID_MINUTES}}}')}
            </Text>

            <Text className="pt-2 text-center text-[12px] leading-[26px]">{copy.ignore}</Text>
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

export function getOtpLoginText(locale: EmailLocale): string {
  const copy = getOtpLoginCopy(locale)
  return `${copy.heading}

{{{CODE}}}

${copy.expires('{{{MAX_VALID_MINUTES}}}')}

${copy.ignore}`
}
