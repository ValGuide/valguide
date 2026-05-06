import { createFileRoute, Link } from '@tanstack/react-router'
import { HomeLayout } from 'fumadocs-ui/layouts/home'
import { baseOptions } from '@/lib/layout.shared'

export const Route = createFileRoute('/')({
  component: Home,
})

const defaultDocsPath = import.meta.env.VALGUIDE_DOCS_MODE === 'workspace' ? 'workspace/onboarding' : 'overview'

function Home() {
  return (
    <HomeLayout {...baseOptions()}>
      <div className="flex flex-col flex-1 justify-center px-4 py-8 text-center">
        <h1 className="font-medium text-2xl mb-2">ValGuide Docs</h1>
        <p className="text-fd-muted-foreground mb-6">Architecture, patterns, and guides for the ValGuide platform.</p>
        <Link
          to="/docs/$"
          params={{ _splat: defaultDocsPath }}
          className="px-4 py-2 rounded-lg bg-fd-primary text-fd-primary-foreground font-medium text-sm mx-auto"
        >
          Browse Documentation
        </Link>
      </div>
    </HomeLayout>
  )
}
