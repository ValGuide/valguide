import { ReactNode } from 'react'
import Image from 'next/image'

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
  imageUrl = 'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80',
  imageAlt = 'Authentication background',
}: AuthLayoutProps) {
  return (
    <main className="min-h-svh flex flex-row">
      {/* Left side - Content */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="w-full h-full max-w-md space-y-8 flex justify-center flex-col">{children}</div>
      </div>

      {/* Right side - Image */}
      <div className="hidden md:block md:w-1/2 bg-gray-100">
        <div className="h-full w-full relative">
          <Image src={imageUrl} alt={imageAlt} fill style={{ objectFit: 'cover' }} />
        </div>
      </div>
    </main>
  )
}
