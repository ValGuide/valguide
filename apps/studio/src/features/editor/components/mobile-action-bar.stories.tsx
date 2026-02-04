import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { MobileActionBar, MobileMoreMenu, MobileSavePublish } from './mobile-action-bar'

const mobileMoreMenuMeta = {
  title: 'Studio/Editor/MobileMoreMenu',
  component: MobileMoreMenu,
  parameters: {
    layout: 'centered',
    viewport: { defaultViewport: 'mobile1' },
  },
  tags: ['autodocs'],
  args: {
    onUnpublishClick: fn(),
    onDiscardClick: fn(),
  },
} satisfies Meta<typeof MobileMoreMenu>

export default mobileMoreMenuMeta
type MobileMoreMenuStory = StoryObj<typeof mobileMoreMenuMeta>

export const Unpublished: MobileMoreMenuStory = {
  args: {
    hasDraft: true,
    hasPublished: false,
  },
}

export const Published: MobileMoreMenuStory = {
  args: {
    hasDraft: true,
    hasPublished: true,
  },
}

export const PublishedWithDraft: MobileMoreMenuStory = {
  args: {
    hasDraft: true,
    hasPublished: true,
  },
}

// MobileSavePublish stories
export const SavePublishDefault: StoryObj<typeof MobileSavePublish> = {
  render: (args) => <MobileSavePublish {...args} />,
  args: {
    hasDraft: true,
    isDirty: false,
    isSaving: false,
    isPublishing: false,
    onSave: fn(),
    onPublishClick: fn(),
  },
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
}

export const SavePublishWithChanges: StoryObj<typeof MobileSavePublish> = {
  render: (args) => <MobileSavePublish {...args} />,
  args: {
    hasDraft: true,
    isDirty: true,
    isSaving: false,
    isPublishing: false,
    onSave: fn(),
    onPublishClick: fn(),
  },
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
}

export const SavePublishSaving: StoryObj<typeof MobileSavePublish> = {
  render: (args) => <MobileSavePublish {...args} />,
  args: {
    hasDraft: true,
    isDirty: true,
    isSaving: true,
    isPublishing: false,
    onSave: fn(),
    onPublishClick: fn(),
  },
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
}

export const SavePublishPublishing: StoryObj<typeof MobileSavePublish> = {
  render: (args) => <MobileSavePublish {...args} />,
  args: {
    hasDraft: true,
    isDirty: false,
    isSaving: false,
    isPublishing: true,
    onSave: fn(),
    onPublishClick: fn(),
  },
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
}

// Combined MobileActionBar stories
export const CombinedDefault: StoryObj<typeof MobileActionBar> = {
  render: (args) => <MobileActionBar {...args} />,
  args: {
    hasDraft: true,
    hasPublished: false,
    isDirty: false,
    isSaving: false,
    isPublishing: false,
    onSave: fn(),
    onPublishClick: fn(),
    onUnpublishClick: fn(),
    onDiscardClick: fn(),
  },
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
}

export const CombinedPublished: StoryObj<typeof MobileActionBar> = {
  render: (args) => <MobileActionBar {...args} />,
  args: {
    hasDraft: true,
    hasPublished: true,
    isDirty: true,
    isSaving: false,
    isPublishing: false,
    onSave: fn(),
    onPublishClick: fn(),
    onUnpublishClick: fn(),
    onDiscardClick: fn(),
  },
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
}
