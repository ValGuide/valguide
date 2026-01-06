import '@valguide/ui/styles/globals.css'

import { getTranslations } from '@valguide/core/i18n/mock-server'
import type { PageParamsWithLocale } from '@valguide/core/utils/types'
import { i18nStaticParams, supportedLocales, type SupportedLocale } from '@valguide/i18n/i18n.config'
import { getMessages } from '@valguide/i18n/messages'
import type { Metadata, Viewport } from 'next'
import { Bricolage_Grotesque as BricolageGrotesque, Geist, Geist_Mono } from 'next/font/google'
// biome-ignore lint/style/noRestrictedImports: notFound is only available from next/navigation
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import { Providers } from '@/components/providers'

const fontSans = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
})

const fontMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})

// TODO: add groteske ront
const _inter = BricolageGrotesque({ subsets: ['latin'] })

export const generateStaticParams = () => i18nStaticParams

export const generateMetadata = async (props: PageParamsWithLocale): Promise<Metadata> => {
  const { locale } = await props.params
  const t = await getTranslations({ locale, namespace: 'www.metadata' })
  return {
    title: t('title'),
    description: t('description'),
  }
}

// fix for new Chrome viewport behavior
// see https://stackoverflow.com/questions/76026292/why-is-window-innerheight-incorrect-until-i-tap-chrome-android
// and https://developer.chrome.com/blog/viewport-resize-behavior?hl=en
export const viewport: Viewport = {
  width: 'device-width',
  interactiveWidget: 'resizes-content',
}

export default async function RootLayout({
  children,
  params,
}: PageParamsWithLocale<{
  children: ReactNode
}>) {
  const locale = (await params).locale

  // Ensure that the incoming `locale` is valid
  if (!supportedLocales.includes(locale as SupportedLocale)) {
    notFound()
  }

  // Load messages for the current locale
  const messages = await getMessages(locale as SupportedLocale)

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased`}>
        <Providers locale={locale} messages={messages}>
          {children}
        </Providers>
      </body>
    </html>
  )
}
