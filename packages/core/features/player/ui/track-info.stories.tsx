import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { themes } from '@valguide/ui/theme/themes'
import { TrackInfo } from './track-info'

const meta: Meta<typeof TrackInfo> = {
  title: 'Player/TrackInfo',
  component: TrackInfo,
}

export default meta

const sampleAlbumArt = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop&q=80'

export const All: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-6">
      {themes.map((theme) => (
        <div className="flex flex-col gap-2 p-4" data-theme={theme} key={theme}>
          <h1>{theme}</h1>
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col gap-2 w-64">
              <span>Default with Album Art</span>
              <TrackInfo title="Bohemian Rhapsody" artist="Queen" albumArt={sampleAlbumArt} variant="default" />
            </div>
            <div className="flex flex-col gap-2 w-64">
              <span>Default without Album Art</span>
              <TrackInfo title="Bohemian Rhapsody" artist="Queen" variant="default" />
            </div>
            <div className="flex flex-col gap-2 w-64">
              <span>Muted with Album Art</span>
              <TrackInfo title="Bohemian Rhapsody" artist="Queen" albumArt={sampleAlbumArt} variant="muted" />
            </div>
            <div className="flex flex-col gap-2 w-64">
              <span>Muted without Album Art</span>
              <TrackInfo title="Bohemian Rhapsody" artist="Queen" variant="muted" />
            </div>
          </div>
        </div>
      ))}
    </div>
  ),
}

export const WithAlbumArt: StoryObj<typeof TrackInfo> = {
  args: {
    title: 'Bohemian Rhapsody',
    artist: 'Queen',
    albumArt: sampleAlbumArt,
    variant: 'default',
  },
}

export const WithoutAlbumArt: StoryObj<typeof TrackInfo> = {
  args: {
    title: 'Bohemian Rhapsody',
    artist: 'Queen',
    variant: 'default',
  },
}

export const Muted: StoryObj<typeof TrackInfo> = {
  args: {
    title: 'Bohemian Rhapsody',
    artist: 'Queen',
    albumArt: sampleAlbumArt,
    variant: 'muted',
  },
}

export const LongTitleAndArtist: StoryObj<typeof TrackInfo> = {
  args: {
    title: 'This is a very long title that should be truncated in the UI',
    artist: 'This is a very long artist name that should also be truncated in the UI',
    albumArt: sampleAlbumArt,
    variant: 'default',
  },
}
