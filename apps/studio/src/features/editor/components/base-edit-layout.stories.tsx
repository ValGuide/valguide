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
            defaultValue="Sample Tour Title"
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

const MockBreadcrumb = () => (
  <Button variant="ghost" size="sm" className="-ml-2 shrink-0">
    <ChevronLeft className="h-4 w-4" />
    <span>Art Museum Tour</span>
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
    contentType: 'tour',
    activeLocale: 'en',
    availableLocales: ['en', 'de', 'rm'],
    isDirty: false,
    isSaving: false,
    isPublishing: false,
    onLocaleChange: fn(),
    onSave: fn(),
    onPublish: fn(),
    onUnpublish: fn(),
    onDiscard: fn(),
    onBack: fn(),
    backLabel: 'Tour Details',
    children: <MockContent />,
  },
} satisfies Meta<typeof BaseEditLayout>

export default meta
type Story = StoryObj<typeof meta>

export const TourUnpublished: Story = {
  args: {
    title: 'Introduction to Modern Art',
    status: { status: 'unpublished', indicator: null },
    hasDraft: true,
    hasPublished: false,
  },
}

export const TourPublished: Story = {
  args: {
    title: 'Introduction to Modern Art',
    status: { status: 'published', indicator: 'up-to-date' },
    hasDraft: true,
    hasPublished: true,
  },
}

export const TourWithChanges: Story = {
  args: {
    title: 'Introduction to Modern Art',
    status: { status: 'published', indicator: 'changed' },
    hasDraft: true,
    hasPublished: true,
    isDirty: true,
  },
}

export const TourSaving: Story = {
  args: {
    title: 'Introduction to Modern Art',
    status: { status: 'published', indicator: 'changed' },
    hasDraft: true,
    hasPublished: true,
    isDirty: true,
    isSaving: true,
  },
}

export const TourPublishing: Story = {
  args: {
    title: 'Introduction to Modern Art',
    status: { status: 'unpublished', indicator: null },
    hasDraft: true,
    hasPublished: false,
    isPublishing: true,
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
  },
}
