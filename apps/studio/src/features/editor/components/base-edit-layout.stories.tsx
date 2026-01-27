import type { Meta, StoryObj } from '@storybook/react'
import { Button } from '@valguide/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@valguide/ui/components/card'
import { ChevronLeft, Globe } from 'lucide-react'
import { fn } from 'storybook/test'
import { BaseEditLayout } from './base-edit-layout'

const MockContent = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between gap-4">
      <h2 className="text-sm font-semibold sm:text-base">Content (English)</h2>
    </div>
    <Card>
      <CardHeader>
        <CardTitle>Metadata</CardTitle>
        <CardDescription>Edit the title and description</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="mock-title" className="text-sm font-medium">
            Title
          </label>
          <input
            id="mock-title"
            type="text"
            className="w-full rounded-md border px-3 py-2"
            defaultValue="Sample Guide Title"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="mock-desc" className="text-sm font-medium">
            Description
          </label>
          <textarea
            id="mock-desc"
            className="w-full rounded-md border px-3 py-2"
            rows={3}
            defaultValue="A sample description..."
          />
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          Shared Content
        </CardTitle>
        <CardDescription>Content shared across all languages</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-dashed p-8 text-center text-muted-foreground">
          Cover Image Picker Placeholder
        </div>
      </CardContent>
    </Card>
  </div>
)

const MockSidebar = () => (
  <>
    <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Guide Progress</h3>
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm">
        <span className="h-2 w-2 rounded-full bg-success" />
        <span>Title added</span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <span className="h-2 w-2 rounded-full bg-success" />
        <span>Description added</span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <span className="h-2 w-2 rounded-full bg-muted" />
        <span>Cover image missing</span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <span className="h-2 w-2 rounded-full bg-muted" />
        <span>No stops added</span>
      </div>
    </div>
  </>
)

const MockBreadcrumb = () => (
  <Button variant="ghost" size="sm" className="-ml-2 shrink-0">
    <ChevronLeft className="h-4 w-4" />
    <span>Art Museum Guide</span>
  </Button>
)

const meta = {
  title: 'Studio/Editor/BaseEditLayout',
  component: BaseEditLayout,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  args: {
    title: 'Introduction to Modern Art',
    status: { status: 'unpublished', indicator: null },
    hasDraft: true,
    hasPublished: false,
    contentType: 'guide',
    activeLocale: 'en',
    availableLocales: ['en', 'de', 'rm'],
    isDirty: false,
    isSaving: false,
    isPublishing: false,
    activeTab: 'draft',
    onLocaleChange: fn(),
    onTabChange: fn(),
    onSave: fn(),
    onPublish: fn(),
    onUnpublish: fn(),
    onDiscard: fn(),
    onBack: fn(),
    backLabel: 'Guide Details',
    children: <MockContent />,
  },
} satisfies Meta<typeof EntityEditLayout>

export default meta
type Story = StoryObj<typeof meta>

export const GuideUnpublished: Story = {
  args: {
    title: 'Introduction to Modern Art',
    status: { status: 'unpublished', indicator: null },
    hasDraft: true,
    hasPublished: false,
    sidebar: <MockSidebar />,
  },
}

export const GuidePublished: Story = {
  args: {
    title: 'Introduction to Modern Art',
    status: { status: 'published', indicator: 'up-to-date' },
    hasDraft: true,
    hasPublished: true,
    sidebar: <MockSidebar />,
  },
}

export const GuideWithChanges: Story = {
  args: {
    title: 'Introduction to Modern Art',
    status: { status: 'published', indicator: 'changed' },
    hasDraft: true,
    hasPublished: true,
    isDirty: true,
    sidebar: <MockSidebar />,
  },
}

export const GuideSaving: Story = {
  args: {
    title: 'Introduction to Modern Art',
    status: { status: 'published', indicator: 'changed' },
    hasDraft: true,
    hasPublished: true,
    isDirty: true,
    isSaving: true,
    sidebar: <MockSidebar />,
  },
}

export const GuidePublishing: Story = {
  args: {
    title: 'Introduction to Modern Art',
    status: { status: 'unpublished', indicator: null },
    hasDraft: true,
    hasPublished: false,
    isPublishing: true,
    sidebar: <MockSidebar />,
  },
}

export const StopWithBreadcrumb: Story = {
  args: {
    title: 'The Starry Night',
    status: { status: 'unpublished', indicator: null },
    hasDraft: true,
    hasPublished: false,
    contentType: 'stop',
    breadcrumbContent: <MockBreadcrumb />,
    backLabel: undefined,
    onBack: undefined,
    sidebar: undefined,
  },
}

export const StopPublished: Story = {
  args: {
    title: 'The Starry Night',
    status: { status: 'published', indicator: 'up-to-date' },
    hasDraft: true,
    hasPublished: true,
    contentType: 'stop',
    breadcrumbContent: <MockBreadcrumb />,
    backLabel: undefined,
    onBack: undefined,
    sidebar: undefined,
  },
}

export const PublishedTabActive: Story = {
  args: {
    title: 'Introduction to Modern Art',
    status: { status: 'published', indicator: 'up-to-date' },
    hasDraft: true,
    hasPublished: true,
    activeTab: 'published',
    sidebar: <MockSidebar />,
  },
}
