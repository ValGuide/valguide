import { createFileRoute } from '@tanstack/react-router'
import { MarketingHomePage } from '@/features/marketing/components/marketing-home-page'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return <MarketingHomePage />
}
