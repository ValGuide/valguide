import React from 'react'
import { HomeButton } from './home-button'

export type NotFoundPageProps = {
  i18n: {
    title: string
    description: string
  }
}

export const NotFoundPage = ({ i18n }: NotFoundPageProps) => {
  return (
    <div className="min-h-svh flex flex-col flex-1 items-center justify-center px-8">
      <h1 className="text-5xl font-bold text-center">{i18n.title}</h1>
      <p className="py-8 max-w-md text-center">{i18n.description}</p>
      <HomeButton />
    </div>
  )
}
