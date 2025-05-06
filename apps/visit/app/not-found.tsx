import '@valguide/ui/styles/globals.css'

import { Providers } from '@/components/providers'
import { Geist, Geist_Mono } from 'next/font/google'
import { defaultLocale, SupportedLocale } from '@valguide/i18n/i18n.config'
import { getMessages } from '@valguide/i18n/messages'
import { NotFoundPage } from '@valguide/features/404/not-found-page'

export const runtime = 'edge'

const fontSans = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
})

const fontMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})

// This page renders when a route like `/unknown.txt` is requested
// that is not matched by the middlware.
export default async function GlobalNotFound() {
  // TODO: localise the global not-found page
  const locale = 'en'
  const messages = await getMessages(locale as SupportedLocale)
  return (
    <html lang={defaultLocale} suppressHydrationWarning>
      <body className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased`}>
        <Providers locale={defaultLocale} messages={messages}>
          <NotFoundPage
            i18n={{
              title: messages.notFound.title,
              description: messages.notFound.description,
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
