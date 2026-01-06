import { Image } from '@unpic/react'
import { useTranslations } from '@valguide/core/i18n/mock'
import { type ReactNode, useEffect, useState } from 'react'

const QUOTE_KEYS = ['quote1', 'quote2', 'quote3', 'quote4', 'quote5', 'quote6']

export interface AuthLayoutProps {
  /**
   * The form or content to display on the left side
   */
  children: ReactNode
  /**
   * The image URL to display on the right side
   */
  imageUrl?: string
  /**
   * Alt text for the image
   */
  imageAlt?: string
}

/**
 * A layout component for authentication pages with a split screen design.
 * On desktop, it shows a form on the left and an image on the right.
 * On mobile, it shows only the form centered on the screen.
 */
export function AuthLayout({
  children,
  imageUrl = 'https://images.unsplash.com/photo-1554907984-15263bfd63bd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  imageAlt = 'Museum visitor exploring art gallery',
}: AuthLayoutProps) {
  const t = useTranslations('auth.quotes')
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false)
      setTimeout(() => {
        setCurrentQuoteIndex((prev) => (prev + 1) % QUOTE_KEYS.length)
        setIsVisible(true)
      }, 500) // Wait for fade out before changing quote
    }, 10000) // Change every 10 seconds

    return () => clearInterval(interval)
  }, [])

  const currentQuoteKey = QUOTE_KEYS[currentQuoteIndex]
  const currentQuote = {
    text: t(`${currentQuoteKey}.text`),
    author: t(`${currentQuoteKey}.author`),
  }

  return (
    <main className="min-h-svh flex flex-row">
      {/* Left side - Content */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full h-full max-w-md space-y-8 flex justify-center flex-col">{children}</div>
      </div>

      {/* Right side - Image */}
      <div className="hidden lg:block lg:w-1/2 bg-gray-100">
        <div className="h-full w-full relative">
          <Image
            src={imageUrl}
            alt={imageAlt}
            layout="fullWidth"
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Quote Overlay */}
          {currentQuote && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-12">
              <div
                className={`text-center max-w-4xl transition-opacity duration-500 ${
                  isVisible ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <blockquote className="text-white">
                  <p className="text-4xl lg:text-5xl font-serif italic mb-6 leading-relaxed drop-shadow-lg">
                    "{currentQuote.text}"
                  </p>
                  <footer className="text-2xl text-white/95 font-medium drop-shadow-md">— {currentQuote.author}</footer>
                </blockquote>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
