import { PageTitle } from '@valguide/core/ui/components/page-title'
import { HomeButton } from './home-button'

export type NotFoundPageProps = {
  i18n: {
    title: string
    description: string
    homeButton?: string
  }
}

export const NotFoundPage = ({ i18n }: NotFoundPageProps) => {
  return (
    <div className="min-h-svh flex flex-1 flex-col items-center justify-center px-8">
      <PageTitle size="xl">{i18n.title}</PageTitle>
      <p className="py-8 max-w-md text-center text-muted-foreground">{i18n.description}</p>
      <HomeButton label={i18n.homeButton} />
    </div>
  )
}