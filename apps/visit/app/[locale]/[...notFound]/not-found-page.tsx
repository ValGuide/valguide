import React from 'react'
import { Link } from '@/i18n/routing'
import { Button } from '@valguide/ui/components/button'

export type NotFoundPageProps = {
  i18n: {
    title: string
    description: string
  }
}

export default function NotFoundPage({ i18n }: NotFoundPageProps) {
  return (
    <div className="h-svh flex flex-col flex-1 items-center justify-center px-8">
      <h1 className="text-5xl font-bold text-center">{i18n.title}</h1>
      <p className="py-8 max-w-md text-center">{i18n.description}</p>
      <HomeButton />
    </div>
  )
}

const HomeButton = () => (
  <Link href="/">
    <Button size="default">
      <svg
        className="size-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      Home
    </Button>
  </Link>
)
