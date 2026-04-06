import { createFileRoute } from '@tanstack/react-router'
import { ComingSoonPage } from '@/features/home/coming-soon-page'

export const Route = createFileRoute('/')({
  component: ComingSoonPage,
})
