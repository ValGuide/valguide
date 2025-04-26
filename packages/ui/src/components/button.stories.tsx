import { Meta, StoryObj } from '@storybook/react'
import { Button } from './button'
import { themes } from '@valguide/ui/theme/themes'

const meta: Meta<typeof Button> = {
  title: 'Common/Button',
  component: Button,
}

export default meta

export const All: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-6">
      {themes.map((theme) => (
        <div className="flex flex-col gap-2 p-4" data-theme={theme} key={theme}>
          <h1>{theme}</h1>
          <div className="flex flex-wrap gap-4">
            <Button variant="default">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
            <Button variant="ghost">Ghost</Button>
          </div>
        </div>
      ))}
    </div>
  ),
}

export const Primary: StoryObj<typeof Button> = {
  args: {
    children: 'Click me',
    variant: 'default',
  },
}

export const Secondary: StoryObj<typeof Button> = {
  args: {
    children: 'Click me',
    variant: 'secondary',
  },
}

export const Outline: StoryObj<typeof Button> = {
  args: {
    children: 'Click me',
    variant: 'outline',
  },
}

export const Destructive: StoryObj<typeof Button> = {
  args: {
    children: 'Click me',
    variant: 'destructive',
  },
}

export const Link: StoryObj<typeof Button> = {
  args: {
    children: 'Click me',
    variant: 'link',
  },
}

export const Ghost: StoryObj<typeof Button> = {
  args: {
    children: 'Click me',
    variant: 'ghost',
  },
}
