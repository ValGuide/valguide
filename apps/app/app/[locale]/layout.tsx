import '@valguide/ui/styles/globals.css'

import { Bricolage_Grotesque as BricolageGrotesque, Geist, Geist_Mono } from 'next/font/google'
import { Providers } from '@/components/providers'
import { Metadata, Viewport } from 'next'
import { PageParamsWithLocale } from '@valguide/core/utils/types'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { ReactNode } from 'react'
import { i18nStaticParams, SupportedLocale } from '@valguide/i18n/i18n.config'
import { routing } from '@valguide/i18n/routing'
import { notFound } from 'next/navigation'
import { getMessages } from '@valguide/i18n/messages'

const fontSans = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
})

const fontMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})

// TODO: add groteske ront
const inter = BricolageGrotesque({ subsets: ['latin'] })

export const generateStaticParams = () => i18nStaticParams

export const generateMetadata = async (props: PageParamsWithLocale): Promise<Metadata> => {
  const { locale } = await props.params
  const t = await getTranslations({ locale, namespace: 'app.metadata' })
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
  if (!routing.locales.includes(locale as any)) {
    notFound()
  }

  setRequestLocale(locale)

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
