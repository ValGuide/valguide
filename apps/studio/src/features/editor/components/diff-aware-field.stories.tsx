import type { Meta, StoryObj } from '@storybook/react'
import { Input } from '@valguide/ui/components/input'
import { DiffAwareField, DiffFieldLabel, DiffTextDisplay } from './diff-aware-field'

const meta: Meta<typeof DiffAwareField> = {
  title: 'Editor/DiffAwareField',
  component: DiffAwareField,
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof DiffAwareField>

export const WithChangedField: Story = {
  args: {
    fieldDiff: {
      field: 'title',
      draft: 'New Title',
      published: 'Old Title',
      hasChanged: true,
    },
    children: <Input defaultValue="New Title" className="w-64" />,
  },
}

export const WithNewField: Story = {
  args: {
    fieldDiff: {
      field: 'title',
      draft: 'New Title',
      published: null,
      hasChanged: true,
    },
    children: <Input defaultValue="New Title" className="w-64" />,
  },
}

export const Unchanged: Story = {
  args: {
    fieldDiff: {
      field: 'title',
      draft: 'Same Title',
      published: 'Same Title',
      hasChanged: false,
    },
    children: <Input defaultValue="Same Title" className="w-64" />,
  },
}

// DiffFieldLabel stories below

export const LabelChanged: StoryObj<typeof DiffFieldLabel> = {
  render: () => (
    <DiffFieldLabel
      fieldDiff={{
        field: 'title',
        draft: 'New',
        published: 'Old',
        hasChanged: true,
      }}
    >
      Title *
    </DiffFieldLabel>
  ),
}

export const LabelNew: StoryObj<typeof DiffFieldLabel> = {
  render: () => (
    <DiffFieldLabel
      fieldDiff={{
        field: 'title',
        draft: 'New',
        published: null,
        hasChanged: true,
      }}
    >
      Title *
    </DiffFieldLabel>
  ),
}

export const LabelUnchanged: StoryObj<typeof DiffFieldLabel> = {
  render: () => (
    <DiffFieldLabel
      fieldDiff={{
        field: 'title',
        draft: 'Same',
        published: 'Same',
        hasChanged: false,
      }}
    >
      Title *
    </DiffFieldLabel>
  ),
}

// DiffTextDisplay stories
export const TextDisplayWithDiff: StoryObj<typeof DiffTextDisplay> = {
  render: () => (
    <DiffTextDisplay
      fieldDiff={{
        field: 'title',
        draft: 'The updated museum tour',
        published: 'The original museum tour',
        hasChanged: true,
      }}
      diffEnabled={true}
      currentValue="The updated museum tour"
    />
  ),
}

export const TextDisplayNoDiff: StoryObj<typeof DiffTextDisplay> = {
  render: () => (
    <DiffTextDisplay
      fieldDiff={{
        field: 'title',
        draft: 'The museum tour',
        published: 'The museum tour',
        hasChanged: false,
      }}
      diffEnabled={true}
      currentValue="The museum tour"
    />
  ),
}
