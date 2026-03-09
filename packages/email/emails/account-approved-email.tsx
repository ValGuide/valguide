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
import { getAccountApprovedCopy } from '../templates/copy'
import { defaultEmailLocale, type EmailLocale } from '../templates/locales'

export interface AccountApprovedEmailProps {
  studioUrl: string
  logoUrl: string
  locale?: EmailLocale
}

export const AccountApprovedEmail = ({
  studioUrl,
  logoUrl,
  locale = defaultEmailLocale,
}: AccountApprovedEmailProps) => {
  const copy = getAccountApprovedCopy(locale)
  const previewText = copy.preview

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
              {copy.heading}
            </Heading>

            <Text className="text-black text-[14px] leading-[24px]">{copy.body}</Text>

            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                href={studioUrl}
              >
                {copy.cta}
              </Button>
            </Section>

            <Text className="text-black text-[14px] leading-[24px]">
              {copy.copyUrl}
              <br />
              <a href={studioUrl} className="text-blue-600 no-underline">
                {studioUrl}
              </a>
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

AccountApprovedEmail.PreviewProps = {
  studioUrl: 'https://studio.valguide.com',
  logoUrl: '/static/demo-logo.png',
  locale: 'en',
} as AccountApprovedEmailProps

export default AccountApprovedEmail
